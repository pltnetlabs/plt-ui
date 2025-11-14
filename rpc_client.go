package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

const defaultRPCURL = "http://localhost:26657"

// NodeStatus represents the relevant details returned by /status.
type NodeStatus struct {
	Moniker             string `json:"moniker"`
	Network             string `json:"network"`
	Version             string `json:"version"`
	LatestBlockHeight   int64  `json:"latestBlockHeight"`
	EarliestBlockHeight int64  `json:"earliestBlockHeight"`
	CatchingUp          bool   `json:"catchingUp"`
}

// Peer is a simplified representation of a Tendermint peer.
type Peer struct {
	ID       string `json:"id"`
	Moniker  string `json:"moniker"`
	RemoteIP string `json:"remoteIp"`
}

// UnconfirmedTxs holds the summary of transactions currently in the mempool.
type UnconfirmedTxs struct {
	Total int      `json:"total"`
	Txs   []string `json:"txs"`
}

// rpcClient handles HTTP calls to the Tendermint RPC.
type rpcClient struct {
	mu         sync.RWMutex
	baseURL    string
	httpClient *http.Client
}

func newRPCClient(baseURL string) *rpcClient {
	return &rpcClient{
		baseURL: sanitizeBaseURL(baseURL),
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *rpcClient) SetBaseURL(baseURL string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.baseURL = sanitizeBaseURL(baseURL)
}

func (c *rpcClient) BaseURL() string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.baseURL
}

func sanitizeBaseURL(baseURL string) string {
	trimmed := strings.TrimSpace(baseURL)
	if trimmed == "" {
		return defaultRPCURL
	}
	return strings.TrimRight(trimmed, "/")
}

func (c *rpcClient) fetch(ctx context.Context, path string) ([]byte, error) {
	if ctx == nil {
		ctx = context.Background()
	}

	if path == "" {
		return nil, fmt.Errorf("empty path")
	}

	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	target := c.BaseURL() + path
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request %s: %w", path, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		snippet := strings.TrimSpace(string(body))
		if snippet == "" {
			snippet = "no response body"
		}
		return nil, fmt.Errorf("rpc error (%s): %s", resp.Status, snippet)
	}

	return body, nil
}

func (c *rpcClient) GetNodeStatus(ctx context.Context) (*NodeStatus, error) {
	raw, err := c.fetch(ctx, "/status")
	if err != nil {
		return nil, err
	}

	var resp struct {
		Result struct {
			NodeInfo struct {
				Moniker string `json:"moniker"`
				Network string `json:"network"`
				Version string `json:"version"`
			} `json:"node_info"`
			SyncInfo struct {
				LatestBlockHeight   string `json:"latest_block_height"`
				EarliestBlockHeight string `json:"earliest_block_height"`
				CatchingUp          bool   `json:"catching_up"`
			} `json:"sync_info"`
		} `json:"result"`
	}

	if err := json.Unmarshal(raw, &resp); err != nil {
		return nil, fmt.Errorf("decode /status: %w", err)
	}

	latest, err := parseInt64(resp.Result.SyncInfo.LatestBlockHeight)
	if err != nil {
		return nil, fmt.Errorf("parse latest block height: %w", err)
	}

	earliest, err := parseInt64(resp.Result.SyncInfo.EarliestBlockHeight)
	if err != nil {
		return nil, fmt.Errorf("parse earliest block height: %w", err)
	}

	return &NodeStatus{
		Moniker:             resp.Result.NodeInfo.Moniker,
		Network:             resp.Result.NodeInfo.Network,
		Version:             resp.Result.NodeInfo.Version,
		LatestBlockHeight:   latest,
		EarliestBlockHeight: earliest,
		CatchingUp:          resp.Result.SyncInfo.CatchingUp,
	}, nil
}

func (c *rpcClient) GetPeers(ctx context.Context) ([]Peer, error) {
	raw, err := c.fetch(ctx, "/net_info")
	if err != nil {
		return nil, err
	}

	var resp struct {
		Result struct {
			Peers []struct {
				NodeInfo struct {
					ID      string `json:"id"`
					Moniker string `json:"moniker"`
				} `json:"node_info"`
				RemoteIP string `json:"remote_ip"`
			} `json:"peers"`
		} `json:"result"`
	}

	if err := json.Unmarshal(raw, &resp); err != nil {
		return nil, fmt.Errorf("decode /net_info: %w", err)
	}

	peers := make([]Peer, 0, len(resp.Result.Peers))
	for _, peer := range resp.Result.Peers {
		peers = append(peers, Peer{
			ID:       peer.NodeInfo.ID,
			Moniker:  peer.NodeInfo.Moniker,
			RemoteIP: peer.RemoteIP,
		})
	}

	return peers, nil
}

func (c *rpcClient) GetUnconfirmedTxs(ctx context.Context, limit int) (*UnconfirmedTxs, error) {
	if limit <= 0 {
		limit = 50
	}

	raw, err := c.fetch(ctx, fmt.Sprintf("/unconfirmed_txs?limit=%d", limit))
	if err != nil {
		return nil, err
	}

	var resp struct {
		Result struct {
			Total string   `json:"total"`
			Txs   []string `json:"txs"`
		} `json:"result"`
	}

	if err := json.Unmarshal(raw, &resp); err != nil {
		return nil, fmt.Errorf("decode /unconfirmed_txs: %w", err)
	}

	total, err := parseInt(resp.Result.Total)
	if err != nil {
		return nil, fmt.Errorf("parse total txs: %w", err)
	}

	txs := resp.Result.Txs
	if txs == nil {
		txs = []string{}
	}

	return &UnconfirmedTxs{
		Total: total,
		Txs:   txs,
	}, nil
}

func (c *rpcClient) GetNodeInfoRaw(ctx context.Context) (string, error) {
	raw, err := c.fetch(ctx, "/status")
	if err != nil {
		return "", err
	}

	var pretty bytes.Buffer
	if err := json.Indent(&pretty, raw, "", "  "); err != nil {
		// If the payload cannot be indented, return as-is.
		return string(raw), nil
	}

	return pretty.String(), nil
}

func parseInt64(value string) (int64, error) {
	if value == "" {
		return 0, nil
	}
	return strconv.ParseInt(value, 10, 64)
}

func parseInt(value string) (int, error) {
	if value == "" {
		return 0, nil
	}
	parsed, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return 0, err
	}
	return int(parsed), nil
}

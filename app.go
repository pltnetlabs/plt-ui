package main

import (
	"context"
	"os"
)

// App coordinates calls between the frontend and the Tendermint RPC client.
type App struct {
	ctx    context.Context
	client *rpcClient
}

// NewApp creates a new App application struct.
func NewApp() *App {
	baseURL := os.Getenv("PLT_RPC_URL")
	return &App{
		client: newRPCClient(baseURL),
	}
}

// startup is called when the app starts. The context is saved so we can call runtime methods.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// GetNodeStatus fetches the current node status.
func (a *App) GetNodeStatus() (*NodeStatus, error) {
	return a.client.GetNodeStatus(a.contextOrBackground())
}

// GetPeers returns the connected peers.
func (a *App) GetPeers() ([]Peer, error) {
	return a.client.GetPeers(a.contextOrBackground())
}

// GetUnconfirmedTxs returns the transactions currently waiting in the mempool.
func (a *App) GetUnconfirmedTxs(limit int) (*UnconfirmedTxs, error) {
	return a.client.GetUnconfirmedTxs(a.contextOrBackground(), limit)
}

// GetNodeInfoRaw returns the raw JSON payload from /status for debugging purposes.
func (a *App) GetNodeInfoRaw() (string, error) {
	return a.client.GetNodeInfoRaw(a.contextOrBackground())
}

// SetRPCBaseURL allows the frontend to override the RPC base URL at runtime.
func (a *App) SetRPCBaseURL(baseURL string) {
	a.client.SetBaseURL(baseURL)
}

func (a *App) contextOrBackground() context.Context {
	if a.ctx != nil {
		return a.ctx
	}
	return context.Background()
}

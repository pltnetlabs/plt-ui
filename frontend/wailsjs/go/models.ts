export namespace main {
	
	export class NodeStatus {
	    moniker: string;
	    network: string;
	    version: string;
	    latestBlockHeight: number;
	    earliestBlockHeight: number;
	    catchingUp: boolean;
	
	    static createFrom(source: any = {}) {
	        return new NodeStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.moniker = source["moniker"];
	        this.network = source["network"];
	        this.version = source["version"];
	        this.latestBlockHeight = source["latestBlockHeight"];
	        this.earliestBlockHeight = source["earliestBlockHeight"];
	        this.catchingUp = source["catchingUp"];
	    }
	}
	export class Peer {
	    id: string;
	    moniker: string;
	    remoteIp: string;
	
	    static createFrom(source: any = {}) {
	        return new Peer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.moniker = source["moniker"];
	        this.remoteIp = source["remoteIp"];
	    }
	}
	export class UnconfirmedTxs {
	    total: number;
	    txs: string[];
	
	    static createFrom(source: any = {}) {
	        return new UnconfirmedTxs(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total = source["total"];
	        this.txs = source["txs"];
	    }
	}

}


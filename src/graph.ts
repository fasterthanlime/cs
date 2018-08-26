import { allDirs, Cell } from "./types";
import {
  dirToIj,
  eachMapIndex,
  hasDir,
  hasDirs,
  ijAdd,
  ijToIndex
} from "./utils";

interface Network {
  cells: Cell[];
}

export class Graph {
  networksByCell: Network[];
  networks: Set<Network>;

  constructor(cells: Cell[]) {
    this.networksByCell = [];
    this.networks = new Set<Network>();
    eachMapIndex(ij => {
      const idx = ijToIndex(ij);
      const c = cells[idx];
      if (c && hasDirs(c)) {
        let net: Network = {
          cells: [c]
        };
        this.networksByCell[idx] = net;
        for (const dir of allDirs) {
          if (hasDir(c, dir)) {
            let nIJ = ijAdd(c, dirToIj(dir));
            let nIdx = ijToIndex(nIJ);
            let nNet = this.networksByCell[nIdx];
            if (nNet && nNet != net) {
              for (const c of net.cells) {
                nNet.cells.push(c);
                let cIdx = ijToIndex(c);
                this.networksByCell[cIdx] = nNet;
              }
              net = nNet;
            }
          }
        }
      }
    });
    eachMapIndex(ij => {
      const idx = ijToIndex(ij);
      const net = this.networksByCell[idx];
      if (net) {
        this.networks.add(net);
      }
    });
  }
}

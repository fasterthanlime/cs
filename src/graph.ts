import { allDirs, Cell } from "./types";
import {
  dirToIj,
  eachMapIndex,
  hasDir,
  hasDirs,
  ijAdd,
  ijToIndex,
  isValidIJ,
} from "./utils";
import createGraph from "ngraph.graph";
import { PathFinder, aStar } from "ngraph.path";

interface Network {
  cells: Cell[];
  buildings: number[];
}

export class Graph {
  networksByCell: Network[];
  networks: Set<Network>;
  finder: PathFinder;

  constructor(cells: Cell[]) {
    this.networksByCell = [];
    this.networks = new Set<Network>();
    eachMapIndex(ij => {
      const idx = ijToIndex(ij);
      const c = cells[idx];
      if (c && hasDirs(c)) {
        let net: Network = {
          cells: [c],
          buildings: [],
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
    console.log(`Built graph with ${this.networks.size} networks`);

    for (const n of this.networks) {
      for (const c of n.cells) {
        if (c.building) {
          let idx = ijToIndex(c);
          n.buildings.push(idx);
        }
      }
    }

    const g = createGraph();
    eachMapIndex(ij => {
      const idx = ijToIndex(ij);
      const c = cells[idx];
      for (const dir of allDirs) {
        if (hasDir(c, dir)) {
          let nIJ = ijAdd(c, dirToIj(dir));
          if (!isValidIJ(nIJ)) {
            return;
          }
          let nIdx = ijToIndex(nIJ);
          g.addLink(idx, nIdx);
        }
      }
    });
    this.finder = aStar(g, { oriented: true });
  }
}

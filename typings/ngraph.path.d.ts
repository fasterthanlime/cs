declare module "ngraph.path" {
  import { ID, Node, Graph } from "ngraph.graph";
  export interface PathFinder {
    find(from: ID, to: ID): Node<any>[];
  }
  export interface FinderOpts {
    oriented?: boolean;
  }
  export function aStar(graph: Graph, opts?: FinderOpts): PathFinder;
}

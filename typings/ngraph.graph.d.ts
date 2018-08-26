declare module "ngraph.graph" {
  namespace ngraphGraph {
    type ID = string | number;
    interface Node<T> {
      id: ID;
      data?: T;
    }
    export interface LinkOpts {
      weight?: number;
    }
    interface Graph {
      addNode<T>(id: ID, data?: T): void;
      getNode<T>(id: ID): Node<T>;
      addLink(a: ID, b: ID, linkOpts?: LinkOpts): void;
    }
  }
  function ngraphGraph(): ngraphGraph.Graph;
  export = ngraphGraph;
}

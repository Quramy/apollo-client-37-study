import { Link } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";

import type {
  ProductsQuery,
  ProductsQueryVariables
} from "./__generated__/products-query";

const query = gql`
  query ProductsQuery {
    products {
      id
      name
    }
  }
`;

export default function Products() {
  const { data, loading } = useQuery<ProductsQuery, ProductsQueryVariables>(
    query
  );

  if (loading || !data) return null;

  return (
    <>
      <ul>
        {data.products.map(product => (
          <li key={product.id}>
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}

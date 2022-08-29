import { useState } from "react";

import { useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";

import type {
  ProductDetailQuery,
  ProductDetailQueryVariables
} from "./__generated__/product-detail-query";

import type {
  AddReviewMutation,
  AddReviewMutationVariables
} from "./__generated__/add-review-mutation";

import ProductReview, {
  productReviewFragment,
  reviewBodyFragment
} from "./ProductReview";

const query = gql`
  ${productReviewFragment}
  query ProductDetailQuery($id: ID!) {
    product(id: $id) {
      id
      name
      description
      ...ProductReviewFragment
    }
  }
`;

const mutation = gql`
  ${reviewBodyFragment}
  mutation AddReviewMutation($pid: ID!, $commentBody: String!) {
    addReview(
      productId: $pid
      addReviewInput: { commentBody: $commentBody, star: 1 }
    ) {
      __typename
      ...ReviewBodyFragment
    }
  }
`;

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const { data, loading, refetch } = useQuery<
    ProductDetailQuery,
    ProductDetailQueryVariables
  >(query, {
    variables: {
      id: productId
    }
  });

  // Mutation
  const [mutate, { loading: submiting }] = useMutation<
    AddReviewMutation,
    AddReviewMutationVariables
  >(mutation, {
    update: (cache, { data }) => {
      if (!data?.addReview) return;

      const cached = cache.readQuery<
        ProductDetailQuery,
        ProductDetailQueryVariables
      >({
        query,
        variables: {
          id: productId
        }
      });

      if (!cached?.product) return;

      cache.writeQuery<ProductDetailQuery, ProductDetailQueryVariables>({
        query,
        data: {
          product: {
            ...cached.product,
            reviews: [...cached.product.reviews, data.addReview]
          }
        }
      });
    },
    optimisticResponse: (input) => ({
      addReview: {
        __typename: "Review",
        id: btoa(`${Date.now() % 1234567}`),
        commentBody: input.commentBody,
      },
    }),
  });

  if (loading) return <div>loading...</div>;
  if (!data?.product) return <div>not found...</div>;

  const { product } = data;
  return (
    <>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <ProductReview
        product={product}
        submiting={submiting}
        onSubmit={comment =>
          mutate({
            variables: {
              pid: productId,
              ...comment,
            },
          })
        }
      />
    </>
  );
}

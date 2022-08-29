import { useState } from "react";

import { gql } from "@apollo/client";
import type { ReviewBodyFragment } from "./__generated__/review-body-fragment";
import type { ProductReviewFragment } from "./__generated__/product-review-fragment";

export const reviewBodyFragment = gql`
  fragment ReviewBodyFragment on Review {
    id
    commentBody
  }
`;

export const productReviewFragment = gql`
  ${reviewBodyFragment}
  fragment ProductReviewFragment on Product {
    reviews {
      ...ReviewBodyFragment
    }
  }
`;

type Props = {
  product: ProductReviewFragment;
  submiting: boolean;
  onSubmit: (input: Omit<ReviewBodyFragment, "id">) => void;
};

export default function ProductReview({ product, submiting, onSubmit }: Props) {
  const [comment, setComment] = useState("");
  if (!product) return null;
  return (
    <>
      <section>
        <h2>レビュー</h2>
        {product.reviews.length === 0 ? (
          <p>レビューはありません</p>
        ) : (
          <ul>
            {product.reviews.map(({ id, commentBody }) => (
              <li key={id}>
                <p>{commentBody}</p>
              </li>
            ))}
          </ul>
        )}
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit({ commentBody: comment });
            setComment("");
          }}
        >
          <label>
            コメント <br />
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </label>
          <div>
            <button type="submit" disabled={submiting}>
              追加
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

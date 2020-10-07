import { Flex, IconButton } from "@chakra-ui/core";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLodingState] = useState<
    "updoot-loading" | "downdoot-loading" | undefined
  >(undefined);
  const [, vote] = useVoteMutation();

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      marginRight={4}
    >
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) return;

          setLodingState("updoot-loading");
          await vote({
            postId: post.id,
            value: 1,
          });

          setLodingState(undefined);
        }}
        variantColor={post.voteStatus === 1 ? "green" : undefined}
        isLoading={loadingState === "updoot-loading"}
        icon="chevron-up"
        aria-label="up vote"
        shadow="md"
        borderWidth="1px"
      />
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) return;

          setLodingState("downdoot-loading");
          await vote({
            postId: post.id,
            value: -1,
          });
          setLodingState(undefined);
        }}
        variantColor={post.voteStatus === -1 ? "red" : undefined}
        isLoading={loadingState === "downdoot-loading"}
        icon="chevron-down"
        aria-label="down vote"
        shadow="md"
        borderWidth="1px"
      />
    </Flex>
  );
};

export default UpdootSection;

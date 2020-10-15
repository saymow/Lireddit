import React from "react";
import { Box, IconButton, Link } from "@chakra-ui/core";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface PostOptionsButtonsProps {
  id: number;
  creatorId: number;
}

const PostOptionsButtons: React.FC<PostOptionsButtonsProps> = ({
  id,
  creatorId,
}) => {
  const [deletePost] = useDeletePostMutation();

  const { data: meData } = useMeQuery();

  return creatorId !== meData?.me?.id ? null : (
    <Box>
      <NextLink href={"/post/edit/[id]"} as={`/post/edit/${id}`}>
        <IconButton mr={4} icon="edit" aria-label="Update post" />
      </NextLink>
      <IconButton
        as={Link}
        icon="delete"
        aria-label="Delete post"
        onClick={() =>
          deletePost({
            variables: { id },
            update: (cache) => {
              cache.evict({ id: "Post:" + id });
            },
          })
        }
      />
    </Box>
  );
};

export default PostOptionsButtons;

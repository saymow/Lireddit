import { Box, Heading } from "@chakra-ui/core";
import React from "react";
import Layout from "../../components/Layout";
import PostOptionsButtons from "../../components/PostOptionButtons";
import { useGetPostsFromUrl } from "../../utils/useGetPostFromUrl";
import { withApollo } from "../../utils/withApollo";

const Post: React.FC = () => {
  const { data, loading } = useGetPostsFromUrl();

  if (loading) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find the post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading>{data?.post?.title}</Heading>
      <Box marginY={4}>{data?.post?.text}</Box>
      <PostOptionsButtons id={data.post.id} creatorId={data.post.creator.id} />
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);

import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/core";
import NextLink from "next/link";
import React from "react";
import Layout from "../components/Layout";
import PostOptionsButtons from "../components/PostOptionButtons";
import UpdootSection from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { withApollo } from "../utils/withApollo";

const Index = () => {
  const { data, loading, error, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 15,
      cursor: null as string | null,
    },
    notifyOnNetworkStatusChange: true,
  });

  console.log(error);

  return (
    <Layout>
      {!data ? (
        <div>loading...</div>
      ) : (
        <>
          <Stack spacing={8}>
            {data.posts.posts.map((post) =>
              !post ? null : (
                <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
                  <UpdootSection post={post} />
                  <Box flex={1}>
                    <NextLink href={"/post/[id]"} as={`/post/${post.id}`}>
                      <Link>
                        <Heading fontSize="xl">{post.title}</Heading>
                      </Link>
                    </NextLink>
                    <Text>Posted by: {post.creator.username}</Text>
                    <Flex>
                      <Text flex={1} mt={4}>
                        {post.textSnippet}
                      </Text>
                      <PostOptionsButtons
                        id={post.id}
                        creatorId={post.creator.id}
                      />
                    </Flex>
                  </Box>
                </Flex>
              )
            )}
          </Stack>
          <Flex>
            {data.posts.hasMore && (
              <Button
                isLoading={loading}
                m="auto"
                my={8}
                onClick={() => {
                  fetchMore({
                    variables: {
                      limit: variables!.limit,
                      cursor:
                        data.posts.posts[data.posts.posts.length - 1].createdAt,
                    },
                    // updateQuery(
                    //   previousValue,
                    //   { fetchMoreResult }
                    // ): PostsQuery {
                    //   if (!fetchMoreResult) return previousValue as PostsQuery;

                    //   return {
                    //     __typename: "Query",
                    //     posts: {
                    //       __typename: "PaginatedPost",
                    //       hasMore: (fetchMoreResult as PostsQuery).posts
                    //         .hasMore,
                    //       posts: [
                    //         ...previousValue.posts.posts,
                    //         ...fetchMoreResult.posts.posts,
                    //       ],
                    //     },
                    //   };
                    // },
                  });
                }}
              >
                Load more
              </Button>
            )}
          </Flex>
        </>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);

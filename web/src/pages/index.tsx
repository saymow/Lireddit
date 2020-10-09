import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import Layout from "../components/Layout";
import PostOptionsButtons from "../components/PostOptionButtons";
import UpdootSection from "../components/UpdootSection";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as string | null,
  });

  const [{ data: meData }] = useMeQuery();

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

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
                isLoading={fetching}
                m="auto"
                my={8}
                onClick={() => {
                  setVariables((prev) => ({
                    ...prev,
                    cursor:
                      data.posts.posts[data.posts.posts.length - 1].createdAt,
                  }));
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

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

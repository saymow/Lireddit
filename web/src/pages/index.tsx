import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import React, { useState } from "react";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as string | null,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  return (
    <Layout>
      <Flex marginBottom={4}>
        <Heading>LiReddit</Heading>
        <NextLink href="/create-post">
          <Link ml={"auto"}>Create Post</Link>
        </NextLink>
      </Flex>
      {!data ? (
        <div>loading...</div>
      ) : (
        <>
          <Stack spacing={8}>
            {data.posts.posts.map((post) => (
              <Box key={post.id} p={5} shadow="md" borderWidth="1px">
                <Heading fontSize="xl">{post.title}</Heading>
                <Text mt={4}>{post.textSnippet}</Text>
              </Box>
            ))}
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

export default withUrqlClient(createUrqlClient)(Index);

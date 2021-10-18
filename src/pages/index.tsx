import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
} from '../generated/graphql';
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import NextLink from 'next/link';
import { Flex, Link } from '@chakra-ui/layout';
import {
  Box,
  Button,
  Heading,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { UpdootSection } from '../components/UpdootSection';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { isServer } from '../utils/isServer';

const Index = () => {
  const [variables, setVariable] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  const [, deletePost] = useDeletePostMutation();

  const [{ data: meData }] = useMeQuery();

  if (!fetching && !data) {
    return <div>you got query failed for some reason</div>;
  }
  return (
    <Layout>
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) =>
            !p ? null : (
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <UpdootSection post={p} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="xl">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>posted by {p.creator.username}</Text>
                  <Flex align="center">
                    <Text mt={4} flex={1}>
                      {p.textSnippet}
                    </Text>
                    {meData?.me?.id === p.creator.id && (
                      <Box ml="auto">
                        <IconButton
                          icon={<DeleteIcon />}
                          aria-label="Edit Post"
                          ml="auto"
                          onClick={() => {
                            deletePost({ id: p.id });
                          }}
                        />
                        <NextLink
                          href="/post/edit/[id]"
                          as={`/post/edit/${p.id}`}
                        >
                          <IconButton
                            as={Link}
                            icon={<EditIcon />}
                            aria-label="Delete Post"
                            mr={4}
                          />
                        </NextLink>
                      </Box>
                    )}
                  </Flex>
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            my={8}
            m="auto"
            isLoading={fetching}
            onClick={() => {
              setVariable({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
          >
            Load more
          </Button>
        </Flex>
      ) : null}
      <br />
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

'use client';

import {
  Box,
  Button,
  Flex,
  Icon,
  Stack,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Link,
} from '@chakra-ui/next-js';
import NextLink from 'next/link';
import { IoLogoGithub, IoMoonSharp, IoSunnySharp } from 'react-icons/io5';
import { GITHUB_URL } from '@src/consts';

export default function Nav() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Box fontFamily="monospace">
            <Link href="/" as={NextLink}><Button fontSize="xl" as="span">[TTG]</Button></Link>
          </Box>

          <Flex alignItems="center">
            <Stack direction="row" spacing={3}>
              <Button onClick={toggleColorMode}>
                {colorMode === 'light' ? <Icon as={IoMoonSharp} boxSize={6} /> : <Icon as={IoSunnySharp} boxSize={6} />}
              </Button>
              <Link href={GITHUB_URL} target="_blank">
                <Button>
                  <Icon as={IoLogoGithub} boxSize={6} />
                </Button>
              </Link>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}

'use client';

import { useContext } from 'react';
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
import {
  IoLogoGithub, IoMoonSharp, IoSunnySharp, IoMenu,
} from 'react-icons/io5';
import { GITHUB_URL } from '@src/consts';
import { DrawerContext } from '@src/lib';

export default function Nav() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { onToggle } = useContext(DrawerContext);

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={3}>
            <Button onClick={onToggle} display={{ xl: 'none' }}><Icon as={IoMenu} boxSize={6} /></Button>
            <Link href="/" as={NextLink} fontFamily="mono"><Button fontSize="xl" as="span">[TTG]</Button></Link>
          </Stack>

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

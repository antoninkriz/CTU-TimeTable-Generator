'use client';

import {
  Box,
  Heading,
  Container,
  Icon,
  Text,
  Button,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Link,
} from '@chakra-ui/next-js';
import NextLink from 'next/link';
import {
  IoHeart,
} from 'react-icons/io5';
import { GITHUB_URL, PERSONAL_URL } from '@src/consts';

export default function Index() {
  const yellow = useColorModeValue('yellow.500', 'yellow.400');
  const blueLink = useColorModeValue('blue.700', 'blue.300');

  return (
    <>
      <Container maxW="3xl">
        <Stack as={Box} py={{ base: 5, md: 10 }}>
          <Heading fontWeight={600} fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }} lineHeight="110%" pb={10} textAlign="center">
            Studuješ na{' '}
            <Text color="blue.500" fontWeight="900" as="span">
              ČVUT
            </Text>
            ? <Text>Vytvoř si svůj optimální rozvrh hodin!</Text>
          </Heading>
          <Stack as={Box} textAlign="center">
            <Text>Najdi svůj optimální rozvrh bez složitého hledání vhodných paralelek, přednášek, cvičení a samotných předmětů!</Text>
            <Text>Každého studenta již od pradávna jistě trápí stejná otázka:</Text>
            <Text color={yellow} fontWeight="600" as="span">
              „Jak nechodit do školy a zároveň si odnést titul?“
            </Text>
          </Stack>
          <Stack as={Box} textAlign="justify" py={8} pt={0}>
            <Text>
              Mnoho studentů již odpvoěď hledalo, ne mnoho z nás ji ale našlo. Ať proto, že jsou <Text as="i">rok od roku línější a hloupější</Text>, či proto,
              že chtějí pracovat. Však Ty je určitě musíš znáš stejně nejlíp.
            </Text>
            <Text>
              Bohužel nejspíš ani tato appka Ti tuhle otázku bohužel nezodpoví, ale pomůže Ti najít takové složení hodin, které si zvolíš, abys strávil/a ve
              škole času co nejméně.
            </Text>
            <Heading textAlign="center" fontWeight={600} fontSize={{ base: 'md', sm: 'xl', md: '2xl' }} lineHeight="150%" color={yellow}>
              Jak?
            </Heading>
            <Text>
              Stačí si vybrat ze seznamu předměty, které tě zajímají, zvolit, zda chceš chodit na přednášky, nebo cvičení, nebo i do laboratoří, a nechat tvůj
              počítač magicky tyhle informace přechroupat. Během chvilky na tebe vyskočí všechny{' '}
              <Text fontWeight="600" as="i">
                bezkolizní
              </Text>{' '}
              rozvrhy, které splňují Tvé zadání.
            </Text>
            <Text>
              Nemusíš se nijak přihlašovat do{' '}
              <Text fontWeight="600" as="span">
                KOS
              </Text>
              u, seznam předmětů si appka hlídá sama a všechny výpočty probíhají přímo u tebe na počítači. Výhoda toho je, že nemusím platit za žádné servery,
              nevýhoda je, že to může, v příapdě náročnějších výběrů, chvilku trvat.
            </Text>
            <Text>
              V mezičase se mi neboj poslat srdíčko
              na <Text as="span" whiteSpace="nowrap"><Link href={GITHUB_URL} color={blueLink} fontWeight="600" target="_blank">GitHubu</Link> <Icon as={IoHeart} boxSize={4} color="red.500" /></Text>,
              nebo koukni na <Link href={PERSONAL_URL} color={blueLink} fontWeight="600" target="_blank">můj web</Link> (moc tam toho není, ale tímhle odkazem si určitě zlepšuju SEO).
            </Text>
          </Stack>
          <Stack direction="column" spacing={3} align="center" alignSelf="center" position="relative">
            <Link href="/generator" as={NextLink}>
              <Button px={8} py={6} fontFamily="mono" as="span">
                SPUSTIT APPKU
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

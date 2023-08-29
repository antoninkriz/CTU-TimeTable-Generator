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
import paths from '@src/paths';

export default function Index() {
  const yellow = useColorModeValue('yellow.500', 'yellow.400');
  const blueLink = useColorModeValue('blue.700', 'blue.300');

  return (
    <>
      <Container maxW="3xl">
        <Stack as={Box} py={{ base: 5, md: 10 }}>
          <Heading fontWeight={600} fontSize={{ base: 'xl', sm: '2xl', md: '6xl' }} lineHeight="110%" pb={4} textAlign="center">
            Studuješ na{' '}
            <Text color="blue.500" fontWeight="900" as="span">
              ČVUT
            </Text>
            ? <Text>Vytvoř si svůj optimální rozvrh hodin!</Text>
          </Heading>
          <Stack as={Box} textAlign="center">
            <Text>Najdi svůj ideální rozvrh hodin bez otravného hledání vhodných paralelek tvých předmětů!</Text>
          </Stack>
          <Stack as={Box} textAlign="center" mt={4}>
            <Text>Studenty již od pradávna jistě trápí stejná otázka:</Text>
            <Text color={yellow} fontWeight="600" as="span">
              „Jak nechodit do školy a zároveň si odnést titul?“
            </Text>
          </Stack>
          <Stack as={Box} textAlign="justify" py={8} pt={0}>
            <Text>
              Ať už tě odpověď na tuto otázku zajímá proto, že chceš se školou stíhat i práci a své koníčky, nebo jen proto, že jsi{' '}
              <Text as="i">rok od roku hloupější a línější</Text>, tak jsi zde správně!
            </Text>
            <Text>
              Tahle appka Ti tuhle otázku nejspíš sice nezodpoví, ale pomůže Ti najít takové složení hodin, respektive přednášek, cvičení a laboratoří, které si
              zvolíš, abys strávil/a ve škole času co nejméně.
            </Text>
            <Heading textAlign="center" fontWeight={600} fontSize={{ base: 'md', sm: 'xl', md: '2xl' }} lineHeight="150%" color={yellow}>
              Jak?
            </Heading>
            <Text>
              Stačí si vybrat ze seznamu semestr a předměty, které Tě zajímají, zvolit, zda chceš chodit na jen na cvičení nebo i na přednášky. Během chvilky na
              tebe vyskočí všechny{' '}
              <Text fontWeight="600" as="i">
                bezkolizní
              </Text>{' '}
              rozvrhy, které splňují Tvé zadání.
            </Text>
            <Text>
              Neboj, nemusíš se nijak přihlašovat do{' '}
              <Text fontWeight="600" as="span">
                KOS
              </Text>
              u, data appka získává sama bez Tvých údajů. Nemusíš se tedy bát o svá data. Všechny výpočty probíhají pouze na tvém počítači a nikam se nic
              neodesílá. Nikdo se nedozví, že Tě jeho přednášky netrápí. A já ušetřím za náklady na servery.
            </Text>
            <Text>
              V mezičase se mi neboj kliknout na srdíčko na{' '}
              <Text as="span" whiteSpace="nowrap">
                <Link href={GITHUB_URL} color={blueLink} fontWeight="600" target="_blank">
                  GitHubu
                </Link>{' '}
                <Icon as={IoHeart} boxSize={4} color="red.500" />
              </Text>
              , nebo koukni na{' '}
              <Link href={PERSONAL_URL} color={blueLink} fontWeight="600" target="_blank">
                můj web
              </Link>
              . Moc tam toho asi nenajdeš, ale tenhle odkaz mi určitě zlepší SEO.
            </Text>
          </Stack>
          <Stack direction="column" spacing={3} align="center" alignSelf="center" position="relative">
            <Link href={paths.GENERATOR} as={NextLink}>
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

import { Box, Well, Text, Paragraph, SpinnerOG } from '@zoralabs/zord'
import { MintStatus } from '@components/MintStatus'
import { MintDetails } from '@components/MintDetails'
import { ipfsImage } from '@lib/helpers'
import { maxWidth, border, heroImage } from 'styles/styles.css'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { allChains } from 'wagmi'
import getDefaultProvider from '@lib/getDefaultProvider'
import { ethers } from 'ethers'
import abi from '@lib/WAYSPACE-abi.json'
import getDrop from '@lib/getDrop'
import { Spinner } from 'degen'

const axios = require('axios').default

const DropSection = ({ trackNumber, saleDetails }) => {
  const [drop, setDrop] = useState({})
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
  // Create Ethers Contract
  const chain = allChains.find((chain) => chain.id.toString() === chainId)
  const provider = getDefaultProvider(chain.network, chainId)

  useEffect(() => {
    const load = async () => {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
      const contract = new ethers.Contract(contractAddress.toString(), abi, provider)
      const songURI = await contract.songURI(trackNumber)

      const metadataURI = ipfsImage(songURI)
      const { data: metadata } = await axios.get(metadataURI)
      console.log('metadata', metadata)

      // Get Sale Details
      const drop = getDrop(contract.address, metadata, saleDetails)
      console.log('NEW DROP', drop)
      setDrop(drop)
    }

    if (!drop.name) {
      load()
    }
  }, [trackNumber])

  console.log('DROP', drop)

  if (!drop.editionMetadata)
    return (
      <>
        <h1>rendering wayspace...</h1>
        <Spinner />
      </>
    )
  return (
    <Box className={maxWidth} p="x4">
      <Text variant="display-md" mb="x8" align="center">
        {drop.name}
      </Text>
      <Text>{drop?.editionMetadata?.description}</Text>
      <Box mt="x8" mx="auto" style={{ maxWidth: 560 }}>
        <Well className={border} p="x6" style={{ borderBottom: 0 }}>
          <Image
            className={heroImage}
            src={ipfsImage(drop.editionMetadata.imageURI)}
            alt={drop.name}
            height={500}
            width={500}
          />
          {drop.editionMetadata?.mimeType?.includes?.('audio') && (
            <audio controls>
              <source
                src={ipfsImage(drop.editionMetadata.animationURI)}
                type={drop.editionMetadata.mimeType}
              />
              Your browser does not support the audio element.
            </audio>
          )}
        </Well>
        <Well className={border} p="x6">
          <Box>
            {drop != null ? (
              <>
                <MintStatus collection={drop} />
                <MintDetails collection={drop} showPresale={false} />
              </>
            ) : (
              <Paragraph align="center" mt="x8">
                <SpinnerOG />
              </Paragraph>
            )}
          </Box>
        </Well>
      </Box>
    </Box>
  )
}

export default DropSection

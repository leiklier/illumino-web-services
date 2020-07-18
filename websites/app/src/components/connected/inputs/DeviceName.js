import React, { useMemo } from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import withApiDebounce from '../../../HOCs/with-api-debounce'
import TextInput from '../../pure/inputs/Text'
const DebouncedTextInput = withApiDebounce(TextInput)

const DEVICE_QUERY = gql`
    query getDevice($secret: String!) {
        device(secret: $secret) {
            id
            name
        }
    }
`

const CHANGE_DEVICE_NAME = gql`
    mutation setDeviceName($secret: String!, $name: String!) {
        setDeviceName(secret: $secret, name: $name) {
            id
            name
        }
    }
`

const DeviceNameInput = ({ secret }) => {
    const { data } = useQuery(DEVICE_QUERY, {
        variables: { secret },
    })

    const [changeDeviceName, {loading: mutationIsLoading}] = useMutation(CHANGE_DEVICE_NAME)

    const name = useMemo(() => {
        const dataIsFetched = data && data.device && data.device.name
        if(!dataIsFetched) return ''
        
        return data.device.name
    }, [data])

    function handleInput(newName) {
        changeDeviceName({
            variables: {
                secret,
                name: newName,
            }
        })
    }

    return(
        <DebouncedTextInput
            label="Name"
            value={name}
            debouncedOnInput={handleInput}
            isCommiting={mutationIsLoading}
        />
    )
}

export default DeviceNameInput
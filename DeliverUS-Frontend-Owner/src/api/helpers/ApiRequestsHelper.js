import axios from 'axios'
import { handleError } from './Errors'
import { prepareData } from './FileUploadHelper'
import { API_BASE_URL } from '@env'

axios.defaults.baseURL = API_BASE_URL

const get = async route => {
  try {
    const response = await axios.get(route)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

const post = async (route, data = null) => {
  const { config, preparedData } = await prepareData(data)

  try {
    const response = await axios.post(route, preparedData, config)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

const put = async (route, data = null) => {
  const { config, preparedData } = await prepareData(data)

  try {
    const response = await axios.put(route, preparedData, config)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

const destroy = async route => {
  try {
    const response = await axios.delete(route)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

const patch = async (route, data = null) => {
  const { config, preparedData } = await prepareData(data)

  try {
    const response = await axios.patch(route, preparedData, config)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export { get, post, put, destroy, patch }

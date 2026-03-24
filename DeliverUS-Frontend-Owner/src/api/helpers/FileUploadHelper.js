import { Platform } from 'react-native'
import * as mime from 'react-native-mime-types'
import { API_BASE_URL } from '@env'

const getPlatform = () => Platform?.OS ?? 'web'

// Returns {name:fileName, fileObject:file}
const normalizeFile = async file => {
  const asset = file.assets[0]
  const imageType = asset.mimeType || 'image/jpeg'
  // Intentamos obtener el nombre original, si no, generamos uno con la extensión correcta
  const extension = mime.extension(imageType) || 'jpg'
  const fileName = asset.fileName || `upload_${Date.now()}.${extension}`

  if (getPlatform() === 'web') {
    const response = await fetch(asset.uri)
    const blob = await response.blob()

    return {
      name: file.paramName,
      fileObject: new File([blob], fileName, { type: imageType })
    }
  } else {
    return {
      name: file.paramName,
      fileObject: {
        name: fileName, // Usamos el nombre limpio aquí también
        type: imageType,
        uri:
          Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri
      }
    }
  }
}

const getDataWithoutBodyFiles = dataWithFiles => {
  const data = { ...dataWithFiles }
  Object.keys(data)
    .filter(key => data[key] && data[key].assets)
    .forEach(key => delete data[key])
  return data
}

const getFilesFromData = data => {
  return Object.keys(data)
    .filter(
      key =>
        data[key] &&
        data[key].assets &&
        data[key].assets[0] &&
        data[key].assets[0].uri &&
        data[key].assets[0].height
    )
    .map(key => {
      // data[key].height para ver si viene del image picker
      data[key].paramName = key
      return data[key]
    })
}

async function constructFormData(files, dataWithoutFiles) {
  // Añadimos async
  const formData = new FormData()

  // Usamos for...of para poder usar await dentro del bucle
  for (const file of files) {
    const normalizedFile = await normalizeFile(file)
    formData.append(normalizedFile.name, normalizedFile.fileObject)
  }

  Object.keys(dataWithoutFiles).forEach(key => {
    if (dataWithoutFiles[key] !== null) {
      formData.append(key, dataWithoutFiles[key])
    }
  })
  return formData
}

function getMultiPartHeader() {
  return {
    headers: {
      'Content-Type':
        'multipart/form-data; charset=utf-8; boundary="separation between parts";'
    }
  }
}

async function prepareData(preparedData) {
  // Añadimos async
  let config, files
  if (preparedData) {
    files = getFilesFromData(preparedData)
  }
  preparedData = getDataWithoutBodyFiles(preparedData)

  if (files?.length) {
    // Esperamos a que el FormData se construya
    preparedData = await constructFormData(files, preparedData)
    config = getMultiPartHeader()
  }
  return { config, preparedData }
}

const prepareEntityImages = (entity, imagePropertyNames) => {
  const entityCopy = { ...entity }
  imagePropertyNames.forEach(impagePropertyName => {
    if (entityCopy[impagePropertyName]) {
      entityCopy[impagePropertyName] = {
        assets: [{ uri: `${API_BASE_URL}/${entityCopy[impagePropertyName]}` }]
      }
    }
  })

  return entityCopy
}

export {
  normalizeFile,
  getDataWithoutBodyFiles,
  getFilesFromData,
  constructFormData,
  getMultiPartHeader,
  prepareData,
  prepareEntityImages
}

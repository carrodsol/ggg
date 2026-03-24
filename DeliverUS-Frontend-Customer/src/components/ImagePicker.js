import { useEffect } from 'react'
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  Platform,
  Alert
} from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import TextRegular from './TextRegular' // Asegúrate de que la ruta sea correcta

export default function ImagePicker({
  image,
  defaultImage,
  label,
  onImagePicked,
  imageStyle
}) {
  useEffect(() => {
    ;(async () => {
      if (Platform.OS !== 'web') {
        const { status } =
          await ExpoImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert(
            'Permissions required',
            'Sorry, we need camera roll permissions to make this work!'
          )
        }
      }
    })()
  }, [])

  const pickImage = async () => {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    })

    if (!result.canceled) {
      onImagePicked(result)
    }
  }

  // Lógica para decidir qué imagen mostrar
  const getImageSource = () => {
    if (image && image.assets && image.assets[0].uri) {
      // Caso 1: Imagen recién seleccionada del picker (objeto con assets)
      return { uri: image.assets[0].uri }
    }
    if (image && typeof image === 'string') {
      // Caso 2: Imagen que viene del backend (URL string) - Útil para pantallas de Edición
      return { uri: image }
    }
    // Caso 3: Imagen por defecto
    return defaultImage
  }

  return (
    <View style={styles.container}>
      {label && <TextRegular>{label}</TextRegular>}

      <Pressable
        onPress={pickImage}
        style={({ pressed }) => [
          styles.imageWrapper,
          pressed && styles.pressed
        ]}
      >
        <Image style={[styles.image, imageStyle]} source={getImageSource()} />

        {/* Icono de edición superpuesto para mejorar UX */}
        <View style={styles.editIcon}>
          <MaterialCommunityIcons name="pencil" size={20} color="white" />
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%'
  },
  imageWrapper: {
    marginTop: 10,
    position: 'relative'
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5, // Un poco de borde redondeado queda mejor
    borderWidth: 1,
    borderColor: 'gray' // O usa un color de tus GlobalStyles
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderTopLeftRadius: 5
  },
  pressed: {
    opacity: 0.7
  }
})

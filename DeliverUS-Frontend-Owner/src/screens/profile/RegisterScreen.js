import { useContext, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ScrollView
} from 'react-native'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { Formik } from 'formik'
import * as yup from 'yup'
import { showMessage } from 'react-native-flash-message'
import * as GlobalStyles from '../../styles/GlobalStyles'
import maleAvatar from '../../../assets/maleAvatar.png'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import TextError from '../../components/TextError'
import ImagePicker from '../../components/ImagePicker'

export default function RegisterScreen() {
  const { signUp } = useContext(AuthorizationContext)
  const [backendErrors, setBackendErrors] = useState()
  const initialUserValues = {
    firstName: null,
    lastName: null,
    email: null,
    password: null,
    phone: null,
    address: null,
    postalCode: null,
    avatar: null
  }

  const validationSchema = yup.object().shape({
    firstName: yup
      .string()
      .max(255, 'First name too long')
      .required('First name is required'),
    lastName: yup
      .string()
      .max(255, 'Last name too long')
      .required('Last name is required'),
    email: yup
      .string()
      .email('Please enter a valid email')
      .required('Email Address is Required'),
    password: yup
      .string()
      .min(3, ({ min }) => `Password must be at least ${min} characters`)
      .matches(/^\S*$/, 'No spaces are allowed')
      .required('Password is required'),
    phone: yup
      .string()
      .max(255, 'Phone too long')
      .required('Phone is required'),
    address: yup
      .string()
      .max(255, 'Address too long')
      .required('Address is required'),
    postalCode: yup
      .string()
      .max(255, 'Postal code too long')
      .required('Postal code is required')
  })

  const register = data => {
    setBackendErrors([])
    signUp(
      data,
      () =>
        showMessage({
          message: `Success. ${data.firstName}, welcome to DeliverUS! 😀`,
          type: 'success',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        }),
      error => {
        setBackendErrors(error.errors)
      }
    )
  }
  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialUserValues}
      onSubmit={register}
    >
      {({ handleSubmit, setFieldValue, values, isValid }) => (
        <ScrollView>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={75}
          >
            <Pressable
              onPress={Platform.OS === 'ios' ? Keyboard.dismiss : undefined}
            >
              <View style={{ alignItems: 'center' }}>
                <View style={styles.container}>
                  <View style={{ flexDirection: 'row', marginTop: 30 }}>
                    <ImagePicker
                      label="Avatar:"
                      image={values.avatar}
                      defaultImage={maleAvatar}
                      onImagePicked={result => setFieldValue('avatar', result)}
                      imageStyle={styles.image}
                    />
                  </View>
                  <InputItem
                    name="firstName"
                    label="First name"
                    textContentType="name"
                  />
                  <InputItem
                    name="lastName"
                    label="Last name"
                    textContentType="familyName"
                  />
                  <InputItem
                    name="email"
                    label="Email"
                    textContentType="emailAddress"
                    placeholder="owner1@owner.com"
                  />
                  <InputItem
                    name="password"
                    label="Pass"
                    textContentType="password"
                    secureTextEntry={true}
                  />
                  <InputItem
                    name="phone"
                    label="Phone"
                    textContentType="telephoneNumber"
                  />
                  <InputItem
                    name="address"
                    label="Address"
                    textContentType="fullStreetAddress"
                  />
                  <InputItem
                    name="postalCode"
                    label="Postal Code"
                    textContentType="postalCode"
                  />
                  {backendErrors &&
                    backendErrors.map((error, index) => (
                      <TextError key={index}>
                        {error.param}-{error.msg}
                      </TextError>
                    ))}

                  <Pressable
                    disabled={!isValid}
                    onPress={handleSubmit}
                    style={({ pressed }) => [
                      {
                        backgroundColor: pressed
                          ? GlobalStyles.brandSuccessTap
                          : GlobalStyles.brandSuccess
                      },
                      {
                        backgroundColor: !isValid
                          ? GlobalStyles.brandSuccessDisabled
                          : GlobalStyles.brandSuccess
                      },
                      styles.button
                    ]}
                  >
                    <TextRegular textStyle={styles.text}>Sign up</TextRegular>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </ScrollView>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '60%'
  },
  image: {
    borderRadius: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  }
})

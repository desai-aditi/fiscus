import { colors } from '@/constants/theme';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function Index() {
  // const router = useRouter();
  // useEffect(() => {
  //   setTimeout(() => {
  //     router.push('/welcome');
  //   }, 2000);
  // }, [router]);

  return (
    <View style={styles.container}>
      <Image 
        style={styles.logo}
        resizeMode="contain"
        source={require('@/assets/images/icon.png')}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral900,
  },
  logo: {
    height: '20%',
    aspectRatio: 1,
  },
});

import {
  InteractionManager,
  Pressable,
  TextInput,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { scale } from '@/utils/styling';
import { colors } from '@/constants/theme';
import { radius } from '@/constants/scaling';
import * as Clipboard from 'expo-clipboard';

interface SegmentedInputProps {
  length: number;
  value?: string;
  onChange: (val: string) => void;
  secureTextEntry?: boolean; // <-- new
}

const SegmentedInput: React.FC<SegmentedInputProps> = ({
  length,
  value,
  onChange,
  secureTextEntry = false, // default: no masking
}) => {
  const [code, setCode] = useState(value || '');
  const [containerIsFocused, setContainerIsFocused] = useState(false);
  const ref = useRef<TextInput>(null);

  const codeDigitsArray = new Array(length).fill(0);

  const handleChangeText = (text: string) => {
    setCode(text);
    onChange(text);
  };

  const toDigitInput = (_: number, idx: number) => {
    const emptyInputChar = ' ';
    const hasDigit = Boolean(code?.[idx]);
    const digit = hasDigit
      ? secureTextEntry
        ? '•'
        : code[idx] // show actual digit if not masking
      : emptyInputChar;

    const isCurrentDigit = idx === code.length;
    const isLastDigit = idx === length - 1;
    const isCodeFull = code.length === length;

    const isFocused =
      containerIsFocused && (isCurrentDigit || (isLastDigit && isCodeFull));

    const containerStyle = [
      styles.codeInputCellContainer,
      isFocused && styles.inputContainerFocused,
    ];

    return (
      <View key={idx} style={containerStyle}>
        <Text style={[styles.codeInputText, secureTextEntry && styles.secureText]}>{digit}</Text>
      </View>
    );
  };

  const handleOnPress = () => {
    setContainerIsFocused(true);
    ref?.current?.focus();
  };

  const handleLongPress = async () => {
    const clipboardContent = await Clipboard.getStringAsync();
    if (clipboardContent) {
      const sanitized = clipboardContent.replace(/\D/g, '').slice(0, length);
      setCode(sanitized);
      onChange(sanitized);
    }
  };

  const handleOnBlur = () => {
    setContainerIsFocused(false);
  };

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setContainerIsFocused(true);
      ref?.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (value !== undefined && value !== code) {
      setCode(value);
    }
  }, [value]);

  return (
    <View style={styles.container}>
      <Pressable
        onLongPress={handleLongPress}
        style={styles.inputsContainer}
        onPress={handleOnPress}
      >
        {codeDigitsArray.map(toDigitInput)}
      </Pressable>
      <TextInput
        ref={ref}
        value={code}
        onChangeText={handleChangeText}
        onEndEditing={handleOnBlur}
        keyboardType="number-pad"
        returnKeyType="none"
        textContentType={secureTextEntry ? 'password' : 'oneTimeCode'}
        maxLength={length}
        style={styles.hiddenCodeInput}
      />
    </View>
  );
};


export default SegmentedInput;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  inputsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainerFocused: {
    borderColor: colors.black,
    borderWidth: 2
  },
  hiddenCodeInput: {
    position: 'absolute',
    opacity: 0,
    height: 1, // so keyboard works
    width: 1,
  },
  codeInputCellContainer: {
    height: scale(50),
    width: scale(50),
    borderRadius: radius._6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white
  },
  codeInputText: {
    fontSize: scale(18),
    fontWeight: '500',
  },
  secureText: {
    fontSize: scale(40),       // bigger
    fontWeight: '700',  // bold
  },
});

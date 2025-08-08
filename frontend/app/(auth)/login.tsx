import { useAuth } from '@/contexts/authContext';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Link, router } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login: loginUser, user } = useAuth();

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Login', 'Please fill in all fields.');
            return;
        }
        setIsLoading(true);
        const res = await loginUser(email, password);
        console.log("Login response:", res);
        if (res.success) {
            if (user?.securityMethod == 'faceId') {
                router.push('/faceId');
            } else if (user?.securityMethod == 'pin'){
                router.push('/enterPin')
            }

        }
        setIsLoading(false);
        if (!res.success) {
            Alert.alert('Login', res.msg);
        }
    };

    return (
        <View style={styles.container}>

            <View style={styles.form}>
                <Text style={styles.title}>Login</Text>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <Link href={"/forgotPassword"}>Forgot Password?</Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    form: {
        width: 300,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
    },
    input: {
        padding: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
    },
    button: {
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 4,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    }
});
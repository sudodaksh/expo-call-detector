import ExpoCallDetectorModule, { useCallDetector } from 'expo-call-detector';
import { useState, useEffect } from 'react';
import { Button, SafeAreaView, ScrollView, Text, View, Alert } from 'react-native';

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const { isCallActive, isReady } = useCallDetector();

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const permission = await ExpoCallDetectorModule.checkPermission();
      setHasPermission(permission);
    } catch (error) {
      Alert.alert('Error', 'Failed to check permission');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Call Detector Example</Text>
        
        <Group name="Permission Status">
          <Text>Has Permission: {hasPermission ? 'Yes' : 'No'}</Text>
          <View style={{ marginTop: 10, gap: 10 }}>
            <Button title="Check Permission" onPress={checkPermission} />
            {!hasPermission && (
              <Button 
                title="Request Permission" 
                onPress={async () => {
                  try {
                    const result = await ExpoCallDetectorModule.requestPermission();
                    await checkPermission();
                  } catch (error) {
                    Alert.alert('Error', 'Failed to request permission');
                  }
                }} 
              />
            )}
          </View>
        </Group>
        
        <Group name="Call Detection">
          <Text>Ready: {isReady ? 'Yes' : 'No'}</Text>
          <Text>Call Active: {isCallActive ? 'Yes' : 'No'}</Text>
          <Text style={{ fontSize: 30, marginTop: 10 }}>
            {isCallActive ? '📞' : '☎️'}
          </Text>
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  view: {
    flex: 1,
    height: 200,
  },
};

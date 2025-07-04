import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const TasksScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tasks Screen</Text>
      <Text style={styles.subtext}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: SIZES.xl,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.md,
  },
});

export default TasksScreen; 
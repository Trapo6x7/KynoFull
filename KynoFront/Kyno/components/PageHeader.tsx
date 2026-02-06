import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/colors';

const DEFAULT_LEFT_IMAGE = require('@/assets/images/dogillustration2.png');

type PageHeaderProps = {
  leftImage?: ImageSourcePropType;
  onPressLeft?: () => void;
  rightIconName?: React.ComponentProps<typeof Ionicons>['name'];
  rightIconSize?: number;
  rightIconColor?: string;
  onPressRight?: () => void;
  style?: StyleProp<ViewStyle>;
  leftButtonStyle?: StyleProp<ViewStyle>;
  rightButtonStyle?: StyleProp<ViewStyle>;
  leftImageStyle?: StyleProp<ImageStyle>;
};

export default function PageHeader({
  leftImage = DEFAULT_LEFT_IMAGE,
  onPressLeft,
  rightIconName = 'options-outline',
  rightIconSize = 25,
  rightIconColor = Colors.primary,
  onPressRight,
  style,
  leftButtonStyle,
  rightButtonStyle,
  leftImageStyle,
}: PageHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <TouchableOpacity
        style={[styles.headerIconLeft, leftButtonStyle]}
        onPress={onPressLeft}
        activeOpacity={0.8}
      >
        <Image
          source={leftImage}
          style={[styles.headerDogIcon, leftImageStyle]}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {rightIconName ? (
        <TouchableOpacity
          style={[styles.headerIconRight, rightButtonStyle]}
          onPress={onPressRight}
          activeOpacity={0.8}
        >
          <Ionicons
            name={rightIconName}
            size={rightIconSize}
            color={rightIconColor}
          />
        </TouchableOpacity>
      ) : (
        <View style={[styles.headerIconRight, rightButtonStyle]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  headerIconLeft: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: Colors.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconRight: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: Colors.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerDogIcon: {
    width: 30,
    height: 30,
  },
});

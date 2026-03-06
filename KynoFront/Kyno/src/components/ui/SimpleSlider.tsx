import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, LayoutChangeEvent, PanResponder } from 'react-native';
import Colors from '@/src/constants/colors';

const THUMB = 22;

function snap(val: number, step: number) {
  return Math.round(val / step) * step;
}

interface SimpleSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}

export function SimpleSlider({ value, min, max, step = 1, onChange }: SimpleSliderProps) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const startRatio = useRef(0);
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);

  const ratio = width > 0 ? (value - min) / (max - min) : 0;
  const thumbLeft = ratio * width - THUMB / 2;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (widthRef.current > 0) {
          const r = Math.min(Math.max(evt.nativeEvent.locationX / widthRef.current, 0), 1);
          startRatio.current = r;
          onChange(snap(min + r * (max - min), step));
        }
      },
      onPanResponderMove: (_, gs) => {
        if (widthRef.current === 0) return;
        const r = Math.min(Math.max(startRatio.current + gs.dx / widthRef.current, 0), 1);
        onChange(snap(min + r * (max - min), step));
      },
    })
  ).current;

  return (
    <View
      style={styles.sliderContainer}
      onLayout={(e: LayoutChangeEvent) => {
        widthRef.current = e.nativeEvent.layout.width;
        setWidth(e.nativeEvent.layout.width);
      }}
      {...pan.panHandlers}
    >
      <View style={styles.sliderTrackBg} />
      {width > 0 && (
        <>
          <View style={[styles.sliderFillAbs, { width: ratio * width }]} />
          <View style={[styles.sliderThumbAbs, { left: thumbLeft }]} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sliderContainer: {
    height: 30,
    justifyContent: 'center',
    marginVertical: 4,
  },
  sliderTrackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 13,
    height: 4,
    backgroundColor: Colors.grayLight,
    borderRadius: 2,
  },
  sliderFillAbs: {
    position: 'absolute',
    left: 0,
    top: 13,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  sliderThumbAbs: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    top: 4,
  },
});

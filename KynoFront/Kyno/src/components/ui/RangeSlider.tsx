import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, LayoutChangeEvent, PanResponder } from 'react-native';
import Colors from '@/src/constants/colors';

const THUMB = 22;

function snap(val: number, step: number) {
  return Math.round(val / step) * step;
}

interface RangeSliderProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
  step?: number;
}

export function RangeSlider({ min, max, valueMin, valueMax, onChangeMin, onChangeMax, step }: RangeSliderProps) {
  const stepVal = step ?? 1;
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const valueMinRef = useRef(valueMin);
  const valueMaxRef = useRef(valueMax);
  const startRatioMin = useRef(0);
  const startRatioMax = useRef(0);

  useEffect(() => { valueMinRef.current = valueMin; }, [valueMin]);
  useEffect(() => { valueMaxRef.current = valueMax; }, [valueMax]);

  const ratioMin = width > 0 ? (valueMin - min) / (max - min) : 0;
  const ratioMax = width > 0 ? (valueMax - min) / (max - min) : 1;
  const thumbMinLeft = ratioMin * width - THUMB / 2;
  const thumbMaxLeft = ratioMax * width - THUMB / 2;

  const panMin = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRatioMin.current = (valueMinRef.current - min) / (max - min);
      },
      onPanResponderMove: (_, gs) => {
        if (widthRef.current === 0) return;
        const r = Math.min(Math.max(startRatioMin.current + gs.dx / widthRef.current, 0), 1);
        const newVal = snap(min + r * (max - min), stepVal);
        if (newVal < valueMaxRef.current) onChangeMin(newVal);
      },
    })
  ).current;

  const panMax = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRatioMax.current = (valueMaxRef.current - min) / (max - min);
      },
      onPanResponderMove: (_, gs) => {
        if (widthRef.current === 0) return;
        const r = Math.min(Math.max(startRatioMax.current + gs.dx / widthRef.current, 0), 1);
        const newVal = snap(min + r * (max - min), stepVal);
        if (newVal > valueMinRef.current) onChangeMax(newVal);
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
    >
      <View style={styles.sliderTrackBg} />
      {width > 0 && (
        <>
          <View style={[styles.sliderFillAbs, {
            left: ratioMin * width,
            width: (ratioMax - ratioMin) * width,
          }]} />
          <View style={[styles.sliderThumbAbs, { left: thumbMinLeft }]} {...panMin.panHandlers} />
          <View style={[styles.sliderThumbAbs, { left: thumbMaxLeft }]} {...panMax.panHandlers} />
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

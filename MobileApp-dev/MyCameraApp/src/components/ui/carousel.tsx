import React, { useState, useRef } from 'react';
import { View, FlatList, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 1. Carousel Root
export const Carousel = ({ children, style }: any) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

// 2. Carousel Content (실제 슬라이딩 로직)
export const CarouselContent = ({ data, renderItem }: { data: any[], renderItem: any }) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < data.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  };

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        horizontal
        pagingEnabled // 화면 단위로 딱딱 멈추게 함
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
      />
      
      {/* 이동 버튼 (필요한 경우) */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          onPress={() => scrollToIndex(currentIndex - 1)}
          style={[styles.navButton, currentIndex === 0 && { opacity: 0.3 }]}
        >
          <ArrowLeft size={20} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => scrollToIndex(currentIndex + 1)}
          style={[styles.navButton, currentIndex === data.length - 1 && { opacity: 0.3 }]}
        >
          <ArrowRight size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 3. Carousel Item (각 슬라이드의 틀)
export const CarouselItem = ({ children, style }: any) => {
  return (
    <View style={[styles.item, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  item: {
    width: SCREEN_WIDTH - 40, // 양옆 여백 고려
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  navButton: {
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  }
});
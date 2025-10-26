import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Path, G, Rect } from 'react-native-svg';
import { MemorySample } from '../types/api';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

type MemoryGraphProps = {
  data: MemorySample[];
  width?: number;
  height?: number;
};

const { width: screenWidth } = Dimensions.get('window');

export const MemoryGraph: React.FC<MemoryGraphProps> = ({
  data,
  width = screenWidth - spacing.xl * 2,
  height = 120,
}) => {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>No memory data available</Text>
      </View>
    );
  }

  // Calculate graph dimensions
  const padding = spacing.md;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Find min and max values for scaling
  const maxMemory = Math.max(...data.map(d => d.percent));
  const minMemory = Math.min(...data.map(d => d.percent));
  const range = Math.max(maxMemory - minMemory, 10); // Ensure minimum range

  // Generate path data for the line
  const generatePath = () => {
    if (data.length < 2) return '';

    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * graphWidth + padding;
      const y =
        height - padding - ((point.percent - minMemory) / range) * graphHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });

    return points.join(' ');
  };

  // Generate area path (for filled area under the line)
  const generateAreaPath = () => {
    if (data.length < 2) return '';

    const topPoints = data.map((point, index) => {
      const x = (index / (data.length - 1)) * graphWidth + padding;
      const y =
        height - padding - ((point.percent - minMemory) / range) * graphHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });

    const bottomRight = `L ${width - padding} ${height - padding}`;
    const bottomLeft = `L ${padding} ${height - padding}`;

    return `${topPoints.join(' ')} ${bottomRight} ${bottomLeft} Z`;
  };

  const pathData = generatePath();
  const areaPathData = generateAreaPath();

  // Get current memory usage
  const currentMemory = data[data.length - 1];
  const formattedMemory = `${currentMemory.percent.toFixed(1)}%`;

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Memory Usage</Text>
        <Text style={styles.currentValue}>{formattedMemory}</Text>
      </View>

      <View style={[styles.graphContainer, { height }]}>
        <Svg width={width} height={height}>
          {/* Background grid */}
          <G>
            {/* Horizontal grid lines */}
            <Line
              x1={padding}
              y1={padding}
              x2={width - padding}
              y2={padding}
              stroke={colors.border.light}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <Line
              x1={padding}
              y1={height / 2}
              x2={width - padding}
              y2={height / 2}
              stroke={colors.border.light}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <Line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke={colors.border.light}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          </G>

          {/* Filled area under the line */}
          {areaPathData && (
            <Path
              d={areaPathData}
              fill={colors.accent.primary + '20'} // 20% opacity
              stroke="none"
            />
          )}

          {/* Memory usage line */}
          {pathData && (
            <Path
              d={pathData}
              stroke={colors.accent.primary}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Current point indicator */}
          {data.length > 0 && (
            <Rect
              x={width - padding - 4}
              y={
                height -
                padding -
                ((currentMemory.percent - minMemory) / range) * graphHeight -
                4
              }
              width={8}
              height={8}
              fill={colors.accent.primary}
              rx={4}
            />
          )}
        </Svg>
      </View>

      <View style={styles.footer}>
        <Text style={styles.timeLabel}>
          {data.length > 1
            ? `${Math.round(
                (data[data.length - 1].timestamp - data[0].timestamp) / 1000,
              )}s`
            : '0s'}
        </Text>
        <Text style={styles.samplesLabel}>{data.length}/60 samples</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.glass,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  },
  currentValue: {
    fontSize: typography.size.lg,
    color: colors.accent.primary,
    fontWeight: typography.weight.semibold,
  },
  graphContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  timeLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  samplesLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
});

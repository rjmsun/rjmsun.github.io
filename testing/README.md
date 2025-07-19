# Wordle Algorithm Testing Suite

A comprehensive testing framework to analyze the performance of the information-first Wordle solving algorithm.

## Features

- **Large-Scale Testing**: Tests algorithm on 10,000+ random words
- **Comprehensive Metrics**: Success rate, average guesses, standard deviation, etc.
- **Visual Analysis**: Generates detailed graphs and charts
- **Performance Comparison**: Compares against other solving strategies
- **Detailed Reports**: Generates comprehensive text reports

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the test suite:
```bash
python wordle_tester.py
```

## What It Tests

### Core Metrics
- **Success Rate**: Percentage of words solved within 6 guesses
- **Average Guesses**: Mean number of guesses required
- **Standard Deviation**: Consistency of performance
- **Guess Distribution**: How many words solved in 1, 2, 3, etc. guesses

### Algorithm Validation
- **Information-First Strategy**: Validates that algorithm prioritizes information gathering
- **Letter Testing Efficiency**: Confirms new letters are tested optimally  
- **Endgame Performance**: Analyzes performance when few words remain
- **Failure Analysis**: Examines words that couldn't be solved

### Visualizations Generated
- **Histogram**: Distribution of guess counts
- **Performance Comparison**: Algorithm vs other strategies
- **Statistical Analysis**: Mean, confidence intervals, distributions
- **Success Rate Breakdown**: Visual success/failure rates

## Expected Results

Based on the information-first algorithm design:
- **Success Rate**: >99%
- **Average Guesses**: ~3.4-3.6
- **Comparison**: 15-20% better than frequency-based methods
- **Consistency**: Low standard deviation indicating reliable performance

## Output Files

- `wordle_algorithm_analysis.png`: Comprehensive visualization dashboard
- `wordle_performance_report.txt`: Detailed text analysis
- Console output with real-time progress and summary

## Algorithm Highlights Tested

1. **Information Maximization**: Tests 10+ letters in first 2 guesses
2. **Smart Endgame**: Uses distinguishing words when 2 options remain
3. **Full Dictionary Usage**: Leverages entire word list for information guesses
4. **Adaptive Strategy**: Changes approach based on game state 
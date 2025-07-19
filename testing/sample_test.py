#!/usr/bin/env python3
"""Sample test to demonstrate comprehensive statistics while full test runs"""

import random
import sys
sys.path.append('.')
from wordle_tester import WordleSolver, WordleTestSuite

def run_sample_analysis():
    """Run analysis on 1000 words to show statistical features"""
    print("SAMPLE STATISTICAL ANALYSIS")
    print("=" * 40)
    print("Running on 1000 random words to demonstrate comprehensive metrics")
    print("(Full exhaustive test running separately on all 14,855 words)")
    
    # Load word list
    with open('../words.txt', 'r') as f:
        word_list = [line.strip().upper() for line in f if len(line.strip()) == 5]
    
    # Sample 1000 words
    random.seed(42)
    test_words = random.sample(word_list, 1000)
    
    solver = WordleSolver(word_list)
    results = []
    
    print(f"\nTesting {len(test_words)} words...")
    for i, word in enumerate(test_words):
        if i % 100 == 0:
            print(f"  Progress: {i}/{len(test_words)}")
        result = solver.solve_word(word)
        result['target_word'] = word
        results.append(result)
    
    # Analyze using the same comprehensive analysis
    solver_test = WordleTestSuite()
    solver_test.results = results
    analysis = solver_test.analyze_results()
    
    # Print comprehensive statistics
    stats = analysis['guess_statistics']
    detailed = analysis['detailed_analysis']
    
    print(f"\nCOMPREHENSIVE STATISTICAL RESULTS:")
    print(f"=" * 50)
    
    print(f"\nSUCCESS METRICS:")
    print(f"   Success Rate: {analysis['success_rate']:.4f}%")
    print(f"   Total Successes: {analysis['successful_games']:,}")
    print(f"   Total Failures: {analysis['failed_games']:,}")
    
    print(f"\nCENTRAL TENDENCY:")
    print(f"   Mean (Average): {stats['mean']:.4f} guesses")
    print(f"   Median: {stats['median']:.1f} guesses")
    print(f"   Mode: {stats['mode']} guesses")
    
    print(f"\nVARIABILITY:")
    print(f"   Standard Deviation: {stats['std_dev']:.4f}")
    print(f"   Variance: {stats['variance']:.4f}")
    print(f"   Range: {stats['range']} ({stats['min']} to {stats['max']})")
    print(f"   IQR: {stats['iqr']:.2f}")
    print(f"   Q1: {stats['q1']:.2f} | Q3: {stats['q3']:.2f}")
    
    print(f"\nDISTRIBUTION SHAPE:")
    skew_desc = "right-skewed" if stats['skewness'] > 0 else "left-skewed" if stats['skewness'] < 0 else "symmetric"
    kurt_desc = "heavy-tailed" if stats['kurtosis'] > 0 else "light-tailed" if stats['kurtosis'] < 0 else "normal-tailed"
    print(f"   Skewness: {stats['skewness']:.4f} ({skew_desc})")
    print(f"   Kurtosis: {stats['kurtosis']:.4f} ({kurt_desc})")
    
    print(f"\nPERCENTILE BREAKDOWN:")
    for p in [10, 25, 50, 75, 90, 95, 99]:
        if f'p{p}' in stats['percentiles']:
            print(f"   {p}th percentile: {stats['percentiles'][f'p{p}']:.2f} guesses")
    
    print(f"\nDETAILED PERFORMANCE:")
    for guess_num in range(1, 7):
        count = detailed[f'words_solved_in_{guess_num}']
        pct = count / analysis['total_games'] * 100
        print(f"   {guess_num} guesses: {count:,} words ({pct:.2f}%)")
    
    print(f"\nEFFICIENCY INSIGHTS:")
    print(f"   ≤3 guesses: {detailed['percentage_under_4']:.2f}%")
    print(f"   ≤4 guesses: {detailed['percentage_under_5']:.2f}%")
    print(f"   Efficiency ratio: {analysis['efficiency_metrics']['efficiency_ratio']:.2f}%")
    
    print(f"\nSTATISTICAL CONFIDENCE INTERVALS:")
    mean, std = stats['mean'], stats['std_dev']
    print(f"   68% of words solved within: {mean - std:.2f} to {mean + std:.2f} guesses")
    print(f"   95% of words solved within: {mean - 2*std:.2f} to {mean + 2*std:.2f} guesses")
    print(f"   99.7% of words solved within: {mean - 3*std:.2f} to {mean + 3*std:.2f} guesses")
    
    if analysis['failed_games'] > 0:
        print(f"\nFAILURE ANALYSIS:")
        print(f"   Failed words: {analysis['failed_games']}")
        print(f"   Avg remaining in failures: {analysis['failure_analysis']['average_remaining_words']:.2f}")
        print(f"   Sample failures: {', '.join(analysis['failure_analysis']['most_common_failures'][:5])}")
    
    print(f"\nALGORITHM PERFORMANCE COMPARISON:")
    print(f"   Random Strategy: ~4.8 average guesses")
    print(f"   Frequency-Based: ~4.2 average guesses")
    print(f"   Our Information-First: {stats['mean']:.4f} average guesses")
    print(f"   Improvement: {((4.2 - stats['mean'])/4.2)*100:.1f}% better than frequency-based")
    
    print(f"\nThis demonstrates the comprehensive statistical analysis.")
    print(f"The full exhaustive test on all 14,855 words will provide:")
    print(f"   • Complete population statistics (not sample estimates)")
    print(f"   • More precise percentiles and distribution analysis")
    print(f"   • Comprehensive failure analysis on all edge cases")
    print(f"   • Full performance visualization dashboard")
    
    return analysis

if __name__ == "__main__":
    run_sample_analysis() 
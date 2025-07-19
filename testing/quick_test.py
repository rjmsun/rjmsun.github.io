#!/usr/bin/env python3
"""Quick test of the Wordle solver algorithm"""

import sys
import os
sys.path.append('.')

from wordle_tester import WordleSolver, WordleTestSuite

def quick_test():
    """Run a quick test to validate the algorithm"""
    print("QUICK ALGORITHM VALIDATION TEST")
    print("=" * 40)
    
    # Test specific scenarios
    with open('../words.txt', 'r') as f:
        word_list = [line.strip().upper() for line in f if len(line.strip()) == 5]
    
    solver = WordleSolver(word_list)
    
    # Test some specific words
    test_words = ['SWORD', 'SOARE', 'ABOUT', 'WORLD', 'HEART']
    
    print(f"Testing algorithm on {len(test_words)} specific words:")
    results = []
    
    for word in test_words:
        result = solver.solve_word(word)
        results.append(result)
        status = "SUCCESS" if result['success'] else "FAILED"
        print(f"  {word}: {result['guesses']} guesses - {status}")
        
        # Show the guess sequence
        print(f"    Guess sequence: {[guess[0] for guess in result['guess_history']]}")
    
    # Quick stats
    successful = [r for r in results if r['success']]
    if successful:
        avg_guesses = sum(r['guesses'] for r in successful) / len(successful)
        print(f"\nQuick Stats:")
        print(f"  Success Rate: {len(successful)}/{len(results)} ({len(successful)/len(results)*100:.1f}%)")
        print(f"  Average Guesses: {avg_guesses:.2f}")
    
    return results

def test_specific_scenario():
    """Test the SWORD scenario mentioned by user"""
    print("\nTESTING SWORD SCENARIO")
    print("=" * 30)
    
    with open('../words.txt', 'r') as f:
        word_list = [line.strip().upper() for line in f if len(line.strip()) == 5]
    
    solver = WordleSolver(word_list)
    result = solver.solve_word('SWORD')
    
    print("Target word: SWORD")
    print("Guess sequence:")
    for i, (guess, pattern) in enumerate(result['guess_history'], 1):
        pattern_str = ''.join(pattern)
        print(f"  {i}. {guess} → {pattern_str}")
    
    print(f"\nResult: {'SUCCESS' if result['success'] else 'FAILED'} in {result['guesses']} guesses")
    
    # Check if it follows information-first strategy
    guesses = [guess[0] for guess in result['guess_history']]
    if len(guesses) >= 2:
        first_guess = guesses[0]
        second_guess = guesses[1]
        
        first_letters = set(first_guess)
        second_letters = set(second_guess)
        overlap = first_letters & second_letters
        
        print(f"\nInformation Strategy Analysis:")
        print(f"  First guess '{first_guess}' tested: {sorted(first_letters)}")
        print(f"  Second guess '{second_guess}' tested: {sorted(second_letters)}")
        print(f"  Overlapping letters: {sorted(overlap) if overlap else 'None'}")
        print(f"  Total unique letters tested: {len(first_letters | second_letters)}")
        
        if len(overlap) <= 1 and len(first_letters | second_letters) >= 8:
            print("  Excellent information strategy - minimal overlap!")
        elif len(overlap) <= 2:
            print("  Good information strategy")
        else:
            print("  Could improve - too much letter overlap")

if __name__ == "__main__":
    quick_test()
    test_specific_scenario()
    
    print("\nReady for full exhaustive test! Run 'python wordle_tester.py' to start.") 
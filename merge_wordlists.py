# Merge allowed.txt and words.txt into total_allowed.txt

def merge_sorted_files(file1_path, file2_path, output_path):
    with open(file1_path, 'r') as f1, open(file2_path, 'r') as f2, open(output_path, 'w') as output:
        
        line1 = f1.readline().strip()
        line2 = f2.readline().strip()
        
        while line1 and line2:
            if line1.upper() <= line2.upper():
                # Avoid duplicates
                if not (line1.upper() == line2.upper()):
                    output.write(line1 + '\n')
                else:
                    # They're equal, write one and advance both
                    output.write(line1 + '\n')
                    line2 = f2.readline().strip()
                line1 = f1.readline().strip()
            else:
                output.write(line2 + '\n')
                line2 = f2.readline().strip()
        
        # Write remaining lines from file1
        while line1:
            output.write(line1 + '\n')
            line1 = f1.readline().strip()
        
        # Write remaining lines from file2
        while line2:
            output.write(line2 + '\n')
            line2 = f2.readline().strip()

if __name__ == "__main__":
    import os
    
    if not os.path.exists('words.txt'):
        print("Error: words.txt not found!")
        exit(1)
    
    if not os.path.exists('allowed.txt'):
        print("Error: allowed.txt not found!")
        exit(1)
    
    print("Merging words.txt and allowed.txt into total_allowed.txt...")
    merge_sorted_files('words.txt', 'allowed.txt', 'total_allowed.txt')
    
    # Count lines in each file
    with open('words.txt', 'r') as f:
        words_count = len([line for line in f if line.strip()])
    
    with open('allowed.txt', 'r') as f:
        allowed_count = len([line for line in f if line.strip()])
    
    with open('total_allowed.txt', 'r') as f:
        total_count = len([line for line in f if line.strip()])
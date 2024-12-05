def dp(ar):
   
    if sum(ar) == 1:
        return len(ar)
    
    total = 0
    for i in range(len(ar)):
        if ar[i] == 0:
            total += 1
            continue
        ar[i] -= 1
        print(dp(ar))

        total += dp(ar)
        ar[i] += 1 
    
    return total / len(ar)

if __name__ == "__main__":
    n = int(input())
    ar = list(map(int, input().split()))
    print(dp(ar))
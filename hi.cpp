#include<bits/stdc++.h>
using namespace std;

int main(){
    int n,k;
    cin>>n>>k;
    vector<int>arr;
    for(int i=0;i<n;i++){
        int t;
        cin>>t;
        arr.push_back(t);
        if(i>0){
        arr[i]+= arr[i-1];
        }
   }
   int ans=0;
   auto p1 = arr.begin();
   int p2 = 0 ;
   for(auto value : arr){
    cout<<value <<" ";
   }
  for(int i=0; i<=p2; i++){
    while((-arr[i]+*p1) <= k){
    cout<<"p1 value"<<*p1<<" arr value "<< arr[i]<<" diff :"<<p2-i<<endl;
       p1++;
       p2++;
    if(p1 == arr.end()){
        break;
    }
    ans = max(ans,(p2-i));
    }
   if(p1 == arr.end()){
        break;
    }
    
  }
  cout<<ans<<endl;
    return 0;
}
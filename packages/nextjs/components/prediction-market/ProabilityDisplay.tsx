export function ProbabilityDisplay({
  token1Reserve,
  token2Reserve,
  tokenAddress,
  optionIndex,
  label,
}: {
  token1Reserve: bigint;
  token2Reserve: bigint;
  tokenAddress: string;
  optionIndex: number;
  label?: string;
}) {
  const erc20Abi = [
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ] as const;

  const { data: totalSupply } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress as string,
    functionName: "totalSupply",
  });

  const calculateChance = (_token1Reserve: bigint, _token2Reserve: bigint, _optionIndex: number) => {
    if (_token1Reserve === undefined || _token2Reserve === undefined || totalSupply === undefined) return 0;

    if (_token1Reserve === totalSupply && _token2Reserve === totalSupply) return 0.5;

    const token1Sold = Number(formatEther(totalSupply)) - Number(formatEther(_token1Reserve));
    const token2Sold = Number(formatEther(totalSupply)) - Number(formatEther(_token2Reserve));

    const option1Chance = token1Sold / (token1Sold + token2Sold);

    return _optionIndex === 0 ? option1Chance : 1 - option1Chance;
  };

  const probability = calculateChance(token1Reserve, token2Reserve, optionIndex);

  return (
    <div className="bg-base-200 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{label || "Probability"}</h3>
      <div className="radial-progress text-neutral" style={{ "--value": probability * 100 } as any}>
        {(probability * 100).toFixed(2) + "%"}
      </div>
    </div>
  );
}

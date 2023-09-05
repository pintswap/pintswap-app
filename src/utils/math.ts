export const percentChange = (oldVal: string | number, newVal: string | number) => {
    return (((Number(oldVal) - Number(newVal)) / Number(newVal)) * 100).toFixed(2);
};

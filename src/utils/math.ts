export const percentChange = (
    oldVal?: string | number,
    newVal?: string | number,
    times100?: boolean,
) => {
    if (!oldVal || !newVal) return '';
    const diff = (Number(oldVal) - Number(newVal)) / Number(newVal);
    if (times100) return (diff * 100).toFixed(2);
    return diff.toString();
};

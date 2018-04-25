export function test() {
    console.log('module2');
}
let delay = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });
};
delay().then(() => {
    console.log('延迟输出2');
});

这是一个 redux 源码解析项目

项目入口在 ./src/counter, 这是一个只使用 redux, 没有使用 react-redux 的计数器
该应用直接从 src 中引用 redux, 所以可以根据该应用调试 redux 源码

在这个情况下其实只依赖 redux ceateStore 一个方法

~~为了快速安装删除了其中的测试依赖~~
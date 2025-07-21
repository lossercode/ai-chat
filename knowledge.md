### 2025/7/12

实现一个上下固定，中间自由伸展，且中间部分可以滚动的布局。

答案：
```html
<div class="container">
  <div class="top">
    <!-- 固定在顶部的内容 -->
  </div>
  <div class="middle">
    <!-- 中间部分的内容 -->
  </div>
  <div class="bottom">
    <!-- 固定在底部的内容 -->
  </div>
</div>
```
```css  
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;    /* 视窗高度 */  
}
.top, .bottom {
  flex: 0 0 auto;   /* 固定高度 */
}
.middle {
  flex: 1 1 auto;   /* 自适应高度 */
  overflow-y: auto; /* 允许垂直滚动 */
}
```
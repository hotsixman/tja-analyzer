# 특징 - 체력

## 피로 모델
- 노트를 타격할 때 피로가 쌓이고, 빈 공간에서 피로가 회복된다.
- 피로가 높을 때 회복 속도가 줄어든다.

- 피로 회복 속도(R)은 현재 피로량(F)에 반비례한다. 따라서 다음과 같이 식을 세워보자.

$$R(F) = \frac{a}{F+b}$$
- F의 초기값 $F_0$가 주어져있다. 시간 $\Delta t$가 흐른 뒤 피로를 $F_1$이라 하자.
- F의 도함수 $\frac{dF}{dt} = -\frac{a}{F+b}$를 푼다.
    1. $(F+b) \times dF = -a \times dt$
    2. $\int_{F_0}^{F_1}F+b\,dF = \int_{t_0}^{t_1}a\,dt$
        - 이 때 $t_1 = t_0 + \Delta t$이고, $F_1 = F(t_1)$이다.
    3. $(F_1+b)^2 - (F_0 + b)^2 = -a\Delta t$
    4. $F_1 = -b + \sqrt{(F_0+b)^2 - a\Delta t}$
        - $\Delta t$가 0일때 $F_1 = F_0$을 만족한다.
- 따라서 회복 계수 $a, b$와 초기값 $F_0$, 흐른 시간 $\Delta t$가 주어졌을 때 회복된 피로량 $F_1$은 다음과 같다.

$$F_1 = -b + \sqrt{(F_0+b)^2 - a\Delta t}$$

### $R(F) = me^{-nF}$의 경우
분수 모델을 사용할 경우 특정 지점에서 회복속도 함수의 기울기가 확 바뀌므로 지수 모델을 대신 사용할 수 있다.
$$F_1 = \frac{ln(e^{nF_0} + mn\Delta t)}{n}$$

1. $\frac{dF}{dt} = me^{-nF}$
2. $\frac{e^{nF}}{m}dF = dt$
3. $\frac{1}{m}\int_{F_0}^{F_1}e^{nF}dF = \Delta t$
4. $\frac{1}{mn}(e^{nF_1}-e^{nF_0}) = \Delta t$
5. $e^{nF_1} = mn\Delta t + e^{nF_0}$
6. $F_1 = \frac{ln(e^{nF_0} + mn\Delta t)}{n}$
    - $\Delta t=0$일때 $F_1 = F_0$을 만족한다.
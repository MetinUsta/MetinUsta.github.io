# A Technical Explanation of the GRPO Loss Function

*Published: 02-02-2025*

Recently, researchers from DeepSeek published a paper[^1] on their new reasoning model, **DeepSeek R1**, which has caused a big buzz in the AI community. Many people are excited about the model's performance and its low training and inference costs. However, I was particularly interested in the loss function used to train the model.

The paper uses a previously proposed loss function called **GRPO (Group Relative Policy Optimization)**, which is used to train the model in a reinforcement learning setting. In this post, I will share my understanding of it.

[^1]: https://arxiv.org/abs/2501.12948

## What is GRPO?

GRPO is an **online learning** algorithm, meaning that during training, the trained model's own generations are used to update its parameters.

GRPO aims to **maximize the advantage** of the model's generations while at the same time **preventing the model from diverging too much** from the reference policy.

## How does it work?

The GRPO algorithm consists of four steps:
### 1. Generating Completions
We sample a batch of prompts from the training dataset and generate $G$ completions for each prompt.
Each completion is denoted as $o_i$

### 2. Computing the Advantage
For each generation in the set $G$, we compute a **reward score** using either a **reward model** or a **predefined reward function**.

To be able to do relative comparisons among the generations within a given set, we standardize the rewards using the mean and standard deviation of the generation set $G$. Resulting scores are called **Advantage**.

### 3. Estimating the KL Divergence

Instead of directly calculating the KL Divergence between the logits of the current and reference policy, we approximate it using an estimation method. [^2]

[^2]: http://joschu.net/blog/kl-approx.html

### 4. Computing the Loss
This is where, we put all previous calculations together to construct the loss function which is defined as follows:

$$
\mathcal{L}_{\text{GRPO}}(\theta) = -\frac{1}{G} \sum_{i=1}^{G} \frac{1}{|o_i|} \sum_{t=1}^{|o_i|} \left[ \min\!\Biggl( \frac{\pi_\theta(o_{i,t} \mid q, o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t} \mid q, o_{i,<t})} \, \widehat{A}_{i,t}, \; \text{clip}\!\Bigl(\frac{\pi_\theta(o_{i,t} \mid q, o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t} \mid q, o_{i,<t})},\, 1-\epsilon,\, 1+\epsilon\Bigr) \, \widehat{A}_{i,t} \Biggr) - \beta \, \mathbb{D}_{\text{KL}}\!\left[\pi_\theta \,\|\, \pi_{\text{ref}}\right] \right]
$$

## Explanation of the Loss Function
At first glance, the GRPO loss function might look intimidating :)

However if we break it down into meaningful components and first inspect each part separately, then see how they fit together, the whole loss function becomes much easier to understand.

Before doing this however, lets simplify the equation by temporarily removing the minimum operation in it. This term is mainly used to stabilize the training especially if we are doing multiple updates. We will revisit it later once we have understood the core components.

Now we are left with:
$$
\mathcal{L}_{\text{GRPO}}(\theta) = -\frac{1}{G} \sum_{i=1}^{G} \frac{1}{|o_i|} \sum_{t=1}^{|o_i|} \left[ \frac{\pi_\theta(o_{i,t} \mid q, o_{i,<t})}{\left[\pi_\theta(o_{i,t} \mid q, o_{i,<t})\right]_{\text{no grad}}} \, \widehat{A}_{i,t} - \beta \, \mathbb{D}_{\text{KL}}\!\left[\pi_\theta \,\|\, \pi_{\text{ref}}\right] \right]
$$

That already looks more manageable! Now lets split it into meaningful parts:

![GRPO Loss Parts](/assets/grpo-loss-function/grpo_parts.png)

### 1. Importance Sampling Ratio

$$
\frac{\pi_\theta(o_{i,t} \mid q, o_{i,<t})}{\left[\pi_\theta(o_{i,t} \mid q, o_{i,<t})\right]_{\text{no grad}}}
$$

In order to understand the importance sampling ratio in the loss function lets break down its components:

**Policy Model Probability:**

$$
\pi_\theta(o_{i,t} \mid q, o_{i,<t})
$$

here we have:
* $\pi_\theta$: The policy model
* $o_i$: The i-th output/generation
* $q$: The given prompt

Overall, this expression represents the probability assigned by the policy model to generating token $o_{i,t}$, given the prompt q and the preceding tokens $o_{i,<t}$.

**The "No Grad" Expression**

We see the same expression in the denominator, but with an exception: it is marked as **"no grad"**.

This means that during backpropagation, the gradients of this term are not calculated. This allows us to simulate storing the old policy model.
In fact in the original paper [^3], this term is denoted as $ \pi_{\theta_{old}}(o_{i,t} \mid q, o_{i,<t}) $.

**What Does the Ratio Represent?**

By taking the ratio of these two probabilities for token $t$, we calculate how the updated policy compares to the frozen (reference) policy.

* If the ratio is **bigger than 1**, the updated policy assigns a higher probability to generating this token than the old policy.
* If the ratio is **less than 1**, the updated policy assigns a lower probability than the old policy.

### 2. Advantage

$$
\widehat{A}_{i,t} = \frac{r_i - mean(r)}{std(r)}
$$

Similar to the PPO, GRPO also includes an **advantage term** in its loss function. However, while PPO relies on an explicit critic model, GRPO **avoids a separate critic network** by computing the advantage in a "group relative" manner which gives the method its name: **"Group Relative Policy Optimization"**

For a given group of completions generated for a single prompt, we compute reward scores using either a reward model or a reward function. These scores are then standardized using the mean and standard deviation of the group. The resulting values are called advantages and each token in a given completion gets assigned with the same advantage score.

> In the original paper [^3], the authors refer to this method of computing the advantage **"Outcome Supervision"** where each token in a generation receives the same advantage score. They also propose an alternative method called **"Process Supervision"**, which assigns different advantage scores to the different steps of a reasoning chain.


[^3]: https://arxiv.org/abs/2402.03300

#### 2.1 Importance Sampling Ratio × Advantage

In the loss function, we multiply the importance sampling ratio by the advantage. This operation helps to:

* **Emphasize** the advantage of new trajectories that have become more likely under the updated policy compared to the old policy.
* **De-emphasize** the advantage of new trajectories that have already become less likely compared to the old policy.[^4]

[^4]: https://ai.stackexchange.com/questions/7685/why-is-the-log-probability-replaced-with-the-importance-sampling-in-the-loss-fun

In simpler terms:

* If our current policy already assigns a **lower probability** to a token than the old policy, the advantage **should have less impact** on the update.
* If our current policy assigns a **higher probability** to a token, we should take the advantage **more seriously** when adjusting the trajectory.

To understand this better, let's consider the below scenarios:

|  Scenario  | Importance Sampling Ratio | Advantage |
|:----------:|:-------------------------:|:---------:|
| Scenario 1 |         High (>1)         |  Positive |
| Scenario 2 |         High (>1)         |  Negative |
| Scenario 3 |          Low (<1)         |  Positive |
| Scenario 4 |          Low (<1)         |  Negative |


#### Scenario 1

In this case, our new policy assigns a higher probability to the token, and the advantage value is positive, meaning we want to reward the model. As a result, the final weighted value is larger than the original advantage, boosting the update in this direction.

Example:

```Python
importance_sampling_ratio = 1.2
advantage = 0.7

importance_sampling_ratio * advantage
-------------------------------------------------
Output: 0.84 -> The model is rewarded even more for this decision
```

#### Scenario 2

In this case, our new policy assigns a higher probability to the token, and the advantage value is negative, meaning we want to penalize the model. As a result, the final weighted value is larger than the original advantage.

Example:

```Python
importance_sampling_ratio = 1.2
advantage = -0.7

importance_sampling_ratio * advantage
-------------------------------------------------
Output: -0.84 -> The model is penalized even more for this decision
```

#### Scenario 3

In this case, our new policy assigns a lower probability to the token, and the advantage value is positive, meaning we want to reward the model. As a result, the final weighted value is lower than the original advantage. This is due to the fact that we already deviated from the old policy and we no longer need to emphasize this reward. This operation also helps stabilizing the training.

Example:

```Python
importance_sampling_ratio = 0.8
advantage = 0.7

importance_sampling_ratio * advantage
-------------------------------------------------
Output: 0.56 -> Still rewarding the model but lower than the intended reward.
```

#### Scenario 4

In this case, our new policy assigns a lower probability to the token, and the advantage value is negative, meaning we want to penalize the model. As a result, the absolute final weighted value is lower than the original advantage. The reason is the same with the Scenario 3.

Example:

```Python
importance_sampling_ratio = 0.8
advantage = -0.7

importance_sampling_ratio * advantage
-------------------------------------------------
Output: -0.56 -> Still penalizes the model but lower than the original penalty.
```

### 4. KL Divergence Estimation

Finally, The KL Divergence term is included to ensure that while the model is being optimized to favor tokens leading to higher rewards, it does not stray too far from a trusted reference policy, $\pi_{ref}$.

In the huggingface implementation, it is possible to provide a custom reference policy. If none is provided, **the detached version** of the original model is used as $\pi_{ref}$.


For performance reasons, instead of computing the exact KL Divergence, we use an approximation:

$$
\mathbb{D}_{\text{KL}}\!\left[\pi_\theta \,\|\, \pi_{\text{ref}}\right] = \frac{\pi_{\text{ref}}(o_{i,t} \mid q, o_{i,<t})}{\pi_\theta(o_{i,t} \mid q, o_{i,<t})} - \log \frac{\pi_{\text{ref}}(o_{i,t} \mid q, o_{i,<t})}{\pi_\theta(o_{i,t} \mid q, o_{i,<t})} - 1
$$

If we look back at the original loss function, we can see that KL divergence value is multiplied by $\beta$ and then subtracted from the loss. Here:

* The parameter $\beta$ controls the strength of this penalty.
* Since the overall loss function is minimized, subtracting the KL term means that any increase in divergence (i.e. the KL value grows) increases the loss.
* This discourages the model from drifting too far from the reference policy.

### Putting It All Together

![Complete GRPO Loss](/assets/grpo-loss-function/grpo_loss_explanation.png)

If we try to summarize the GRPO loss function in words, it would go something like this:

For all tokens in all generated completions, calculate the ratio of probabilities assigned by the new policy and the old policy, then multiply it by the advantage, which is derived from computed rewards. Finally, to ensure the model does not stray too far from the reference policy, subtract the KL Divergence estimation.

### Let's Add Clipping Operation

At the beginning of this post, we ignored the minimum operation and, consequently, the clipping operation in the original loss function. Now let's look at these parts independently:

#### Clipping operation:

$$
\text{clip}\!\Bigl(\frac{\pi_\theta(o_{i,t} \mid q, o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t} \mid q, o_{i,<t})},\, 1-\epsilon,\, 1+\epsilon\Bigr)
$$

This expression is identical to the importance sampling ratio, except that it gets clipped between $1-\epsilon$ and $1+\epsilon$. This means that whenever the ratio falls outside of these boundaries we set, it will get clipped.

#### Minimum operation:

$$
\min\!\Biggl( \frac{\pi_\theta(o_{i,t} \mid q, o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t} \mid q, o_{i,<t})} \, \widehat{A}_{i,t}, \; \text{clip}\!\Bigl(\frac{\pi_\theta(o_{i,t} \mid q, o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t} \mid q, o_{i,<t})},\, 1-\epsilon,\, 1+\epsilon\Bigr) \, \widehat{A}_{i,t} \Biggr)
$$

Here we pass two values to the min function,
1. The original importance sampling ratio
2. The clipped importance sampling ratio

If the original ratio is outside the allowed range, the clipped version is used thanks to the minimum operation.

**Why Do We Clip?**

In practice, the ratio between the probabilities of the current and old policy models for a given token can grow too quickly. This leads to large gradient updates, which can destabilize training. Especially when performing multiple updates using the same probabilites from the old policy.

By clipping the values, we:
* Prevent excessively large updates
* Ensure a smoother loss curve
* Improve training stability.

## Final Thoughts

I hope you found this post useful! :) For me, it was fun to study and analyze the GRPO loss function.
Now that I've done my research and analysis I feel much more confident in my understanding.

I've done my best to ensure accuracy, but if you spot any mistakes or have suggestions, feel free to open a pull request.

---

*Last updated: February 04, 2025*
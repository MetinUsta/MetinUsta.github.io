# Test Time Reinforcement Learning

A few weeks ago, I came across a paper titled, Test Time Reinforcement Learning (TTRL)[^1] by Zuo et al. They propose a new reward function which removes the need of a label or in another words an answer during training. This instantly grabbed my attention as most of the time it can be a real headache to collect or synthetically generate them. 
Surprisingly their methodology is quite simple:

[^1]: https://arxiv.org/pdf/2504.16084

1. During training they sample N generations from the model.
2. They extract the answers from these generations and count them.
3. The most common answer is considered the correct one.
4. Reward for these N generations are then calculated according to this answer.

Here is a figure from the paper explaining the process visually:
![methodology](assets/test-time-reinforcement-learning/methodology.png)

Since then I wanted to do my own experiments and see if it really works or how much it improves the capabilities of the models. To be able to asses this I needed to see if doing the same training run with and without labels would make a difference. So in the past week, I created a dataset suitable for this task, trained two models and made some analysis on their test results to satisfy my curious inner demons.

In this blog post I will be talking about the details of the each step of my experiments, some related work and my closing thoughts.

First lets talk about the data gathering and preprocessing part.

## Creating the Dataset

In my [previous blog post](post.html?slug=grpo-training), I fiddled with GRPO training, A reinforcement learning method proposed[^2] by researchers from DeepSeek.
I tried training a model on **Turkish financial mathematical** questions. Picking this domain allowed me to use existing reward functions written by the community and this helped me to jump start my experiments. However I was hasty to try this new shiny training method so I made some mistakes while gathering the data. First, due to the nature of this domain, the questions had to be solved using mostly floating point operations. This complicated the training process unnecessarily considering that LLMs even fail to do some basic operations on integers.

So this time I decided to go easy and select an existing English math word problem dataset to work on. I chose [orca-math-word-problems-80k](https://huggingface.co/datasets/mlabonne/orca-math-word-problems-80k)[^3] dataset curated by Maxime Labonne. I then randomly sampled 4.000 questions from the dataset and translated them to Turkish using GPT-4.1. Since I also need the labels to be able to compare the effectiveness of TTRL, I also extracted the numerical answers from the solutions given in this dataset using GPT-4.1 again.

After that I removed samples that contained non-digit characters in it so that only questions with simple integer answers will remain. This step filtered almost %35 percent of the data and I was left with 2.598 samples. I splitted the remaining questions into train (2.000) and test (598) sets.

[^2]: https://arxiv.org/abs/2402.03300
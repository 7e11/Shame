import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";
import * as path from "path";

export class ShameStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const discordToken = this.node.getContext("discordToken");
    const steamApiKey = this.node.getContext("steamApiKey");
    if (!discordToken) throw new Error("Missing required context: discordToken");
    if (!steamApiKey) throw new Error("Missing required context: steamApiKey");

    const logGroup = new logs.LogGroup(this, "ShameBotLogs", {
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const shameBot = new lambdaNodejs.NodejsFunction(this, "ShameBot", {
      entry: path.join(__dirname, "../src/index.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_LATEST,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      logGroup,
      bundling: {
        minify: false,
        sourceMap: true,
      },
      environment: {
        DISCORD_TOKEN: discordToken,
        STEAM_API_KEY: steamApiKey,
      },
    });

    new events.Rule(this, "ShameBotSchedule", {
      schedule: events.Schedule.rate(cdk.Duration.days(1)),
      targets: [new targets.LambdaFunction(shameBot)],
    });
  }
}

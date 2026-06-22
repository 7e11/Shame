#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ShameStack } from "../lib/shame-stack";

const app = new cdk.App();
new ShameStack(app, "ShameStack", {
  env: { region: "us-west-2" },
});

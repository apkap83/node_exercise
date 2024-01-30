import express, { Request, Response } from "express";
import { Op } from "sequelize";

import { User, Message } from "../services/dbService/initDBAndModels";

import {
  getUserById,
  getAllUsersFromDB,
  addUserInDB,
} from "../services/userService/user";
import { Kind } from "graphql/language";
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLScalarType,
} = require("graphql");

const GraphQLDate = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  parseValue(value: string) {
    // value from the client
    return new Date(value);
  },
  serialize(value: Date) {
    // value sent to the client
    return value.toISOString();
  },
  parseLiteral(ast: any) {
    if (ast.kind === Kind.STRING) {
      // ast value is always in string format
      return new Date(ast.value);
    }
    return null;
  },
});

const UserType = new GraphQLObjectType({
  name: "User",
  description: "This Type represents a user from the database",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    firstName: { type: GraphQLNonNull(GraphQLString) },
    surname: { type: GraphQLNonNull(GraphQLString) },
    dateOfBirth: { type: GraphQLDate },
    gender: { type: GraphQLNonNull(GraphQLString) },
    userName: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    user: {
      type: UserType,
      description: "A Single User",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent: any, args: any) => getUserById(args),
    },
    users: {
      type: new GraphQLList(UserType),
      description: "List of All Users",
      resolve: () => getAllUsersFromDB(),
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addUser: {
      type: UserType,
      description: "Add a User to DB",
      args: {
        firstName: { type: GraphQLNonNull(GraphQLString) },
        surname: { type: GraphQLNonNull(GraphQLString) },
        dateOfBirth: { type: GraphQLNonNull(GraphQLString) },
        gender: { type: GraphQLNonNull(GraphQLString) },
        userName: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent: any, args: any) => {
        const user = {
          firstName: args.firstName,
          surname: args.surname,
          dateOfBirth: args.dateOfBirth,
          gender: args.gender,
          userName: args.userName,
        };

        addUserInDB(user);
        console.log(user);
        return user;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

export const myGraphQlRoute = () => {
  return graphqlHTTP({
    schema: schema,
    graphiql: true,
  });
};

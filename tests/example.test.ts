import request from 'supertest';
import { faker } from "@faker-js/faker";

const baseUrl = 'http://127.0.0.1:8000';

describe("Model Management API", () => {
  let modelId: string;
  let versionId: string;

  const name = faker.person.fullName();
  const owner = faker.person.fullName();
  const versionName = faker.word.adjective() + "-" + faker.number.int({ min: 1, max: 1000 });
  const huggingFaceModel = "gpt2";

  it("should successfully create a new model", async () => {
    const response = await request(baseUrl)
      .post('/models')
      .send({ name, owner });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", name);
    expect(response.body).toHaveProperty("owner", owner);
    modelId = response.body.id;
  });

  it("should retrieve the list of models", async () => {
    const response = await request(baseUrl)
      .get('/models');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    const foundItem = response.body.find((item: any) => item.id === modelId);
    expect(foundItem).toBeDefined();
    expect(foundItem).toMatchObject({ id: modelId, name, owner });
  });

  it("should successfully add a new version to a model", async () => {
    const response = await request(baseUrl)
      .post(`/models/${modelId}/versions`)
      .send({ name: versionName, hugging_face_model: huggingFaceModel });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", versionName);
    expect(response.body).toHaveProperty("hugging_face_model", huggingFaceModel);
    versionId = response.body.id;
  });

  it("should retrieve the version details for a model", async () => {
    const response = await request(baseUrl)
      .get(`/models/${modelId}/versions`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    const foundVersion = response.body.find((version: any) => version.id === versionId);
    expect(foundVersion).toBeDefined();
    expect(foundVersion).toMatchObject({
      id: versionId,
      name: versionName,
      hugging_face_model: huggingFaceModel,
    });
  });

  it("should perform inference on a specific model version", async () => {
    const body = {
      text: "text48",
      apply_template: false,
      max_new_tokens: 256,
      do_sample: true,
      temperature: 0.7,
      top_k: 50,
      top_p: 0.95,
    };
    const response = await request(baseUrl)
      .post(`/models/${modelId}/versions/${versionId}/infer`)
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toContain("text48");
  }, 900000);

  it("should successfully delete a version of a model", async () => {
    const response = await request(baseUrl)
      .delete(`/models/${modelId}/versions/${versionId}`);

    expect(response.status).toBe(200);
  });

  it("should successfully delete the created model", async () => {
    const response = await request(baseUrl)
      .delete(`/models/${modelId}`);

    expect(response.status).toBe(200);
  });

  it("should validate the model schema", async () => {
    const response = await request(baseUrl)
      .post('/models')
      .send({ name, owner });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", name);
    expect(response.body).toHaveProperty("owner", owner);
  });

  it("should return an error when creating a model with an existing name and owner", async () => {
    const response = await request(baseUrl)
      .post('/models')
      .send({ name, owner });

    expect(response.status).toBe(400);
    expect(response.body.detail).toBe(`Duplicate name: ${name}`);
  });

  it('should return an error when adding a model with a missing "name" field', async () => {
    const response = await request(baseUrl)
      .post('/models')
      .send({ owner });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("name");
  });

   it("Should return 422 when extra fields are included in the model creation request", async () => {
    const extraField = "Extra Text";
    const response = await request(baseUrl)
      .post('/models')
      .send({ name, owner, extrafield: extraField });

    expect(response.status).toBe(422);
  });

  it("should throw 404 for deleting an already deleted model", async () => {
    const response = await request(baseUrl)
      .delete(`/models/${modelId}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("detail");
    expect(response.body.detail).toBe("Model not found");
  });

  it("should return an error when deleting a non-existent model", async () => {
    const response = await request(baseUrl)
      .delete('/models/invalidModelId');

    expect(response.status).toBe(404);
    expect(response.body.detail).toBe("Model not found");
  });

  it("should return an error for adding a model with an invalid owner", async () => {
    const response = await request(baseUrl)
      .post('/models')
      .send({ name, owner: faker.number.int({ min: 1, max: 5 }) as any });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty("detail");
    expect(response.body.detail).toBeInstanceOf(Array);
    expect(response.body.detail[0]).toHaveProperty("msg", "Input should be a valid string");
  });

  it("should return an error when adding a version to a non-existent model", async () => {
    const response = await request(baseUrl)
      .post('/models/24324/versions')
      .send({ name: versionName, hugging_face_model: huggingFaceModel });

    expect(response.status).toBe(404);
    expect(response.body.detail).toBe("Model not found");
  });

  it("should return 404 for an invalid model and version id for inference request", async () => {
    const invalidBody = {
      text: faker.lorem.sentence(),
      apply_template: 1,
    };
    const response = await request(baseUrl)
      .post('/models/wr234234/versions/234weadf/infer')
      .send(invalidBody);

    expect(response.status).toBe(404);
    expect(response.body.detail).toBe("Model version not found");
  });
});
